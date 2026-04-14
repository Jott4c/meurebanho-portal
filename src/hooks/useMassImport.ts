import { useState } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import type { AnimalCategory, AnimalStatus } from '../types'

export type ImportRow = Record<string, any>

interface ImportMapping {
  ear_tag: string
  category: string
  sex: string
  breed?: string
  color?: string
  birth_date?: string
  weight?: string
  milk_prod?: string
  age?: string
}

export interface ImportOptions {
  weights: boolean
  milk: boolean
  ageAsBirthdate: boolean
}

export function useMassImport() {
  const { propertyId } = useAuth()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const parseFile = (file: File): Promise<ImportRow[]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase()

      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as ImportRow[]),
          error: (error) => reject(error)
        })
      } else if (extension === 'xlsx' || extension === 'xls') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData as ImportRow[])
        }
        reader.onerror = (error) => reject(error)
        reader.readAsArrayBuffer(file)
      } else {
        reject(new Error('Formato de arquivo não suportado. Use CSV ou Excel.'))
      }
    })
  }

  const calculateBirthDateFromAge = (ageRaw: any) => {
    const ageStr = String(ageRaw).toLowerCase()
    const ageValue = parseFloat(ageStr.replace(/[^0-9.]/g, ''))
    if (isNaN(ageValue)) return undefined
    
    const now = new Date()
    if (ageStr.includes('ano')) {
      now.setFullYear(now.getFullYear() - Math.floor(ageValue))
      now.setMonth(now.getMonth() - Math.floor((ageValue % 1) * 12))
    } else {
      // Default: Meses
      now.setMonth(now.getMonth() - Math.floor(ageValue))
    }
    return now.toISOString().split('T')[0]
  }

  const importAnimals = async (data: ImportRow[], mapping: ImportMapping, options: ImportOptions) => {
    if (!propertyId) throw new Error('Propriedade não identificada')
    
    setIsProcessing(true)
    setProgress(0)

    try {
      // 1. Prepare Animals
      const animalsToUpsert = data.map(row => {
        let sex: 'M' | 'F' = 'F'
        const rawSex = String(row[mapping.sex] || '').toUpperCase()
        if (rawSex.startsWith('M') || rawSex.includes('MACHO')) sex = 'M'
        
        const rawCat = String(row[mapping.category] || '').toLowerCase()
        let category: AnimalCategory = 'vaca'
        if (rawCat.includes('bezerro')) category = 'bezerro'
        else if (rawCat.includes('bezerra')) category = 'bezerra'
        else if (rawCat.includes('touro')) category = 'touro'
        else if (rawCat.includes('novilha')) category = 'novilha'
        else if (rawCat.includes('novilho') || rawCat.includes('garrote')) category = 'novilho'

        // Age logic
        let birthDate = mapping.birth_date ? row[mapping.birth_date] : undefined
        if (!birthDate && options.ageAsBirthdate && mapping.age) {
          birthDate = calculateBirthDateFromAge(row[mapping.age])
        }

        return {
          property_id: propertyId,
          ear_tag: String(row[mapping.ear_tag] || ''),
          category,
          sex,
          breed: mapping.breed ? String(row[mapping.breed] || '') : undefined,
          color: mapping.color ? String(row[mapping.color] || '') : undefined,
          birth_date: birthDate,
          status: 'active' as AnimalStatus,
          updated_at: new Date().toISOString()
        }
      }).filter(a => a.ear_tag.trim() !== '')

      // 2. Upsert Animals and collect IDs
      const chunkSize = 50 // Smaller chunks for select
      const allUpserted: { id: string, ear_tag: string }[] = []

      for (let i = 0; i < animalsToUpsert.length; i += chunkSize) {
        const chunk = animalsToUpsert.slice(i, i + chunkSize)
        const { data: upsertedChunk, error } = await supabase
          .from('animals')
          .upsert(chunk, { onConflict: 'property_id,ear_tag' })
          .select('id, ear_tag')
        
        if (error) throw error
        if (upsertedChunk) allUpserted.push(...upsertedChunk)
        
        setProgress(Math.round(((i + chunk.length) / (animalsToUpsert.length * 1.5)) * 100))
      }

      // 3. Conditional Insert: Weights and Milk
      const weightsToInsert: any[] = []
      const milkToInsert: any[] = []

      if (options.weights || options.milk) {
        data.forEach(row => {
          const earTag = String(row[mapping.ear_tag] || '')
          const animalId = allUpserted.find(a => a.ear_tag === earTag)?.id
          
          if (animalId) {
            if (options.weights && mapping.weight && row[mapping.weight]) {
              const weight = parseFloat(String(row[mapping.weight]).replace(',', '.'))
              if (!isNaN(weight)) {
                weightsToInsert.push({
                  animal_id: animalId,
                  property_id: propertyId,
                  weight,
                  date: new Date().toISOString()
                })
              }
            }

            if (options.milk && mapping.milk_prod && row[mapping.milk_prod]) {
              const liters = parseFloat(String(row[mapping.milk_prod]).replace(',', '.'))
              if (!isNaN(liters)) {
                milkToInsert.push({
                  animal_id: animalId,
                  property_id: propertyId,
                  liters,
                  period: 'full_day',
                  date: new Date().toISOString()
                })
              }
            }
          }
        })
      }

      // 4. Final Insert of supplemental data
      if (weightsToInsert.length > 0) {
        const { error } = await supabase.from('animal_weights').insert(weightsToInsert)
        if (error) throw error
      }

      if (milkToInsert.length > 0) {
        const { error } = await supabase.from('milk_productions').insert(milkToInsert)
        if (error) throw error
      }

      setProgress(100)
      await queryClient.invalidateQueries({ queryKey: ['animals'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      return { success: true, count: allUpserted.length }
    } catch (error) {
      console.error('Erro na importação em massa:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    parseFile,
    importAnimals,
    isProcessing,
    progress
  }
}

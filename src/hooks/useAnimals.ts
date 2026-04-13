import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Animal } from '../types'

interface UseAnimalsOptions {
  page?: number
  limit?: number
  search?: string
  status?: string
  category?: string
  sex?: string
  paddockId?: string
  breed?: string
}

export function useAnimals(options: UseAnimalsOptions = {}) {
  const { propertyId } = useAuth()
  const { page, limit, search = '', status, category, sex, paddockId, breed } = options

  return useQuery({
    queryKey: ['animals', propertyId, page, limit, search, status, category, sex, paddockId, breed],
    queryFn: async () => {
      if (!propertyId) return { data: [], count: 0 }

      let query = supabase
        .from('animals')
        .select('*', { count: 'exact' })
        .eq('property_id', propertyId)

      if (status) {
        query = query.eq('status', status)
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (sex) {
        query = query.eq('sex', sex)
      }

      if (paddockId) {
        query = query.eq('paddock_id', paddockId)
      }

      if (breed) {
        query = query.ilike('breed', `%${breed}%`)
      }

      if (search) {
        query = query.ilike('ear_tag', `%${search}%`)
      }

      if (page && limit) {
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      query = query.order('ear_tag', { ascending: true })

      const { data, count, error } = await query

      if (error) throw error

      return { data: data as Animal[], count: count || 0 }
    },
    enabled: !!propertyId
  })
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('animals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useBatchDeleteAnimal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('animals').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useBatchUpdateAnimal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[], updates: Partial<Animal> }) => {
      const { error } = await supabase.from('animals').update(updates).in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

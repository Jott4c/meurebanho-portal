import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Paddock } from '../types'

export function usePaddocks() {
  const { propertyId } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['paddocks', propertyId],
    queryFn: async () => {
      if (!propertyId) return []

      const { data, error } = await supabase
        .from('paddocks')
        .select(`
          *,
          animals(id, paddock_entry_date, status)
        `)
        .eq('property_id', propertyId)
        .eq('animals.status', 'active')
        .order('name', { ascending: true })

      if (error) throw error

      return (data as any[]).map(paddock => {
        const activeAnimals = paddock.animals || []
        const lastEntry = activeAnimals.length > 0
          ? activeAnimals.reduce((latest: string, animal: any) => {
              if (!animal.paddock_entry_date) return latest
              if (!latest) return animal.paddock_entry_date
              return new Date(animal.paddock_entry_date) > new Date(latest) 
                ? animal.paddock_entry_date 
                : latest
            }, "")
          : null

        return {
          ...paddock,
          animal_count: activeAnimals.length,
          last_entry_date: lastEntry
        } as Paddock
      })
    },
    enabled: !!propertyId
  })

  const createPaddock = useMutation({
    mutationFn: async (newPaddock: Omit<Paddock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('paddocks')
        .insert([{ ...newPaddock, property_id: propertyId }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paddocks'] })
    }
  })

  const deletePaddock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('paddocks')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paddocks'] })
    }
  })

  return {
    ...query,
    createPaddock: createPaddock.mutate,
    deletePaddock: deletePaddock.mutate,
    isCreating: createPaddock.isPending,
    isDeleting: deletePaddock.isPending
  }
}

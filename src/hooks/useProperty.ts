import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Property } from '../types'

export function useProperty() {
  const { propertyId } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error) throw error
      return data as Property
    },
    enabled: !!propertyId
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Property>) => {
      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property'] })
    }
  })

  return {
    ...query,
    updateProperty: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  }
}

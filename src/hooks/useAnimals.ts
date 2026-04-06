import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Animal } from '../types'

interface UseAnimalsOptions {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export function useAnimals(options: UseAnimalsOptions = {}) {
  const { propertyId } = useAuth()
  const { page = 1, limit = 10, search = '', status } = options

  return useQuery({
    queryKey: ['animals', propertyId, page, limit, search, status],
    queryFn: async () => {
      if (!propertyId) return { data: [], count: 0 }

      let query = supabase
        .from('animais')
        .select('*', { count: 'exact' })
        .eq('property_id', propertyId)

      if (status) {
        query = query.eq('status', status)
      }

      if (search) {
        query = query.or(`brinco.ilike.%${search}%,nome.ilike.%${search}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to).order('created_at', { ascending: false })

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
      const { error } = await supabase.from('animais').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

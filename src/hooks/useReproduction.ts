import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useReproduction() {
  const { propertyId } = useAuth()

  const metricsQuery = useQuery({
    queryKey: ['reproduction-metrics', propertyId],
    queryFn: async () => {
      if (!propertyId) return null

      // Fetch Semen Stock Total
      const { data: semenData } = await supabase
        .from('semen_stocks')
        .select('quantity')
        .eq('property_id', propertyId)
      
      const totalSemen = semenData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

      // Fetch Active IATF Count
      const { count: iatfCount } = await supabase
        .from('iatf_batches')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .in('status', ['in_progress', 'planned'])

      // Fetch Births (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: birthsCount } = await supabase
        .from('reproductive_events')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .eq('event_type', 'birth')
        .gte('event_date', thirtyDaysAgo.toISOString())

      return {
        totalSemen,
        activeIatf: iatfCount || 0,
        recentBirths: birthsCount || 0
      }
    },
    enabled: !!propertyId
  })

  const eventsQuery = useQuery({
    queryKey: ['reproduction-events', propertyId],
    queryFn: async () => {
      if (!propertyId) return []

      const { data, error } = await supabase
        .from('reproductive_events')
        .select('*, animals(ear_tag)')
        .eq('property_id', propertyId)
        .order('event_date', { ascending: false })
        .limit(20)

      if (error) throw error
      return data
    },
    enabled: !!propertyId
  })

  return {
    metrics: metricsQuery.data,
    events: eventsQuery.data,
    isLoading: metricsQuery.isLoading || eventsQuery.isLoading
  }
}

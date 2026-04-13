import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useReports() {
  const { propertyId } = useAuth()

  return useQuery({
    queryKey: ['reports', propertyId],
    queryFn: async () => {
      if (!propertyId) return null

      // 1. Fetch ALL animals for inventory summary
      const { data: animals, error: animError } = await supabase
        .from('animals')
        .select('*')
        .eq('property_id', propertyId)
      
      if (animError) throw animError

      const inventoryByCategory = (animals || []).reduce((acc: any, curr) => {
        if (curr.status === 'active') {
          acc[curr.category] = (acc[curr.category] || 0) + 1
        }
        return acc
      }, {})

      // 2. Fetch Occurrences and Employee Actions
      const { data: occurrences, error: occError } = await supabase
        .from('occurrences')
        .select(`
          *,
          employees ( name )
        `)
        .eq('property_id', propertyId)
        .order('occurred_at', { ascending: true })

      if (occError) throw occError

      const actionsByEmployee = (occurrences || []).reduce((acc: any, curr) => {
        const empName = curr.employees?.name || 'Sistema'
        acc[empName] = (acc[empName] || 0) + 1
        return acc
      }, {})

      const occurrencesByType = (occurrences || []).reduce((acc: any, curr) => {
        acc[curr.occurrence_type] = (acc[curr.occurrence_type] || 0) + 1
        return acc
      }, {})

      // 3. Sanitary Trends (Monthly)
      const sanitaryTrends = (occurrences || []).reduce((acc: any, curr) => {
        const month = new Date(curr.occurred_at).toLocaleString('pt-BR', { month: 'short' })
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {})

      // 4. Financial (Treatments)
      const { data: treatments, error: treatError } = await supabase
        .from('treatments')
        .select(`
          cost,
          applied_at,
          occurrence:occurrence_id (
            property_id
          )
        `)
        .order('applied_at', { ascending: true })

      if (treatError) throw treatError

      const treatmentsInProperty = treatments.filter((t: any) => 
        t.occurrence?.property_id === propertyId
      )

      const financialByMonth = treatmentsInProperty.reduce((acc: any, curr) => {
        const month = new Date(curr.applied_at).toLocaleString('pt-BR', { month: 'short' })
        acc[month] = (acc[month] || 0) + Number(curr.cost || 0)
        return acc
      }, {})

      return {
        inventoryByCategory,
        financialByMonth,
        occurrencesByType,
        actionsByEmployee,
        sanitaryTrends,
        totalAnimals: animals?.filter(a => a.status === 'active').length || 0,
        totalInvestment: treatmentsInProperty.reduce((sum, t) => sum + Number(t.cost || 0), 0),
        raw: {
          animals,
          occurrences,
          treatments: treatmentsInProperty
        }
      }
    },
    enabled: !!propertyId
  })
}

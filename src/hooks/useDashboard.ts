import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useDashboard() {
  const { propertyId, user, profile } = useAuth()

  return useQuery({
    queryKey: ['dashboard', propertyId, user?.id],
    queryFn: async () => {
      if (!propertyId || !user?.id) return null

      // Buscar total de animais ativos e os dados para o gráfico
      const { data: animaisData, error: animaisError } = await supabase
        .from('animals')
        .select('category')
        .eq('property_id', propertyId)
        .eq('status', 'active')

      if (animaisError) throw animaisError

      const totalAnimais = animaisData.length

      const animaisPorCategoria = animaisData.reduce((acc, curr) => {
        const cat = curr.category || 'Outros'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const chartData = Object.entries(animaisPorCategoria)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }))
        .sort((a, b) => b.value - a.value)

      // Vacinas (simplificado para vaccinations, filtrando as mais recentes)
      const { count: vacinasPendentes, data: proximasVacinas, error: vacinasError } = await supabase
        .from('vaccinations')
        .select('id, vaccine_type, application_date', { count: 'exact' })
        .eq('property_id', propertyId)
        .order('application_date', { ascending: false })
        .limit(5)

      if (vacinasError) throw vacinasError

      // Ocorrências abertas
      // Usaremos um try catch separado caso a relação de animais dê erro em bancos não totalmente migrados
      let ocorrenciasAbertas = 0
      let ultimasOcorrencias: any[] = []

      try {
        const { count, data, error } = await supabase
          .from('occurrences')
          .select('id, occurrence_type, occurred_at, description, animals(ear_tag)', { count: 'exact' })
          .eq('property_id', propertyId)
          .eq('resolved', false)
          .order('occurred_at', { ascending: false })
          .limit(5)
        
        if (error) throw error
        ocorrenciasAbertas = count || 0
        ultimasOcorrencias = data || []
      } catch (err) {
        console.warn('Erro ao buscar ocorrências:', err)
      }

      let funcionariosAtivos = 0
      try {
        const { count, error } = await supabase
          .from('employees')
          .select('id', { count: 'exact', head: true })
          .eq('property_id', propertyId)
          .eq('active', true)
        
        if (error) throw error
        funcionariosAtivos = count || 0
      } catch (err) {
         console.warn('Erro ao buscar funcionários:', err)
      }

      // Buscar plano do usuário
      let plan = profile?.plan || 'free'
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('plan')
          .eq('id', user?.id)
          .single()
        
        console.log('[useDashboard] Plan query:', { userData, userError, userId: user?.id, profilePlan: profile?.plan })
        
        if (userError) throw userError
        if (userData?.plan) plan = userData.plan
      } catch (err) {
        console.warn('[useDashboard] Erro ao buscar plano:', err, '| fallback:', profile?.plan)
      }

      return {
        totalAnimais,
        chartData,
        vacinasPendentes: vacinasPendentes || 0,
        proximasVacinas: proximasVacinas || [],
        ocorrenciasAbertas: ocorrenciasAbertas || 0,
        ultimasOcorrencias: ultimasOcorrencias || [],
        funcionariosAtivos,
        plan: plan as any,
      }
    },
    enabled: !!propertyId
  })
}

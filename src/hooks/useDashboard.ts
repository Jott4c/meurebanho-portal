import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useDashboard() {
  const { propertyId } = useAuth()

  return useQuery({
    queryKey: ['dashboard', propertyId],
    queryFn: async () => {
      if (!propertyId) return null

      // Buscar total de animais ativos e os dados para o gráfico
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('categoria')
        .eq('property_id', propertyId)
        .eq('status', 'ativo')

      if (animaisError) throw animaisError

      const totalAnimais = animaisData.length

      const animaisPorCategoria = animaisData.reduce((acc, curr) => {
        const cat = curr.categoria || 'Outros'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const chartData = Object.entries(animaisPorCategoria)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }))
        .sort((a, b) => b.value - a.value)

      // Vacinas pendentes ou atrasadas
      const { count: vacinasPendentes, data: proximasVacinas, error: vacinasError } = await supabase
        .from('vacinas_lote')
        .select('id, nome_vacina, data_prevista, status', { count: 'exact' })
        .eq('property_id', propertyId)
        .in('status', ['pendente', 'atrasada'])
        .order('data_prevista', { ascending: true })
        .limit(5)

      if (vacinasError) throw vacinasError

      // Ocorrências abertas
      // Usaremos um try catch separado caso a relação de animais dê erro em bancos não totalmente migrados
      let ocorrenciasAbertas = 0
      let ultimasOcorrencias: any[] = []

      try {
        const { count, data, error } = await supabase
          .from('ocorrencias')
          .select('id, tipo, data_ocorrencia, descricao, animais(nome, brinco)', { count: 'exact' })
          .eq('property_id', propertyId)
          .eq('status', 'em_andamento')
          .order('data_ocorrencia', { ascending: false })
          .limit(5)
        
        if (error) throw error
        ocorrenciasAbertas = count || 0
        ultimasOcorrencias = data || []
      } catch (err) {
        console.warn('Erro ao buscar ocorrências:', err)
      }

      // Funcionários ativos
      let funcionariosAtivos = 0
      try {
        const { count, error } = await supabase
          .from('employees')
          .select('id', { count: 'exact', head: true })
          .eq('property_id', propertyId)
          .eq('status', 'ativo')
        
        if (error) throw error
        funcionariosAtivos = count || 0
      } catch (err) {
         console.warn('Erro ao buscar funcionários:', err)
      }

      return {
        totalAnimais,
        chartData,
        vacinasPendentes: vacinasPendentes || 0,
        proximasVacinas: proximasVacinas || [],
        ocorrenciasAbertas: ocorrenciasAbertas || 0,
        ultimasOcorrencias: ultimasOcorrencias || [],
        funcionariosAtivos,
      }
    },
    enabled: !!propertyId
  })
}

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Syringe, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'

export default function Vacinas() {
  const { propertyId } = useAuth()

  const { data: vacinas, isLoading } = useQuery({
    queryKey: ['vacinas', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacinas_lote')
        .select('*')
        .eq('property_id', propertyId!)
        .order('data_prevista', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!propertyId,
  })

  if (isLoading) return <LoadingSpinner message="Carregando vacinas..." />

  const statusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 size={16} className="text-emerald-500" />
      case 'atrasada': return <AlertCircle size={16} className="text-red-500" />
      default: return <Clock size={16} className="text-amber-500" />
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      concluida: 'bg-emerald-100 text-emerald-700',
      atrasada: 'bg-red-100 text-red-700',
      pendente: 'bg-amber-100 text-amber-700',
    }
    const labels: Record<string, string> = {
      concluida: 'Concluída',
      atrasada: 'Atrasada',
      pendente: 'Pendente',
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-neutral-100 text-neutral-600'}`}>
        {statusIcon(status)}
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Calendário de Vacinas</h1>
        <p className="text-sm text-neutral-500 mt-1">Acompanhe todas as campanhas e vacinações do rebanho.</p>
      </div>

      {!vacinas || vacinas.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title="Nenhuma vacina registrada"
          description="Campanhas de vacinação aparecerão aqui quando forem cadastradas."
        />
      ) : (
        <div className="grid gap-4">
          {vacinas.map((vacina: any) => (
            <div key={vacina.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${
                  vacina.status === 'atrasada' ? 'bg-red-50' : 
                  vacina.status === 'concluida' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  <Syringe size={20} className={
                    vacina.status === 'atrasada' ? 'text-red-500' : 
                    vacina.status === 'concluida' ? 'text-emerald-500' : 'text-amber-500'
                  } />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{vacina.nome_vacina}</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Previsto: {new Date(vacina.data_prevista).toLocaleDateString('pt-BR')}
                    {vacina.data_aplicacao && ` · Aplicada: ${new Date(vacina.data_aplicacao).toLocaleDateString('pt-BR')}`}
                  </p>
                  {vacina.lote && <p className="text-xs text-neutral-400 mt-1">Lote: {vacina.lote}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(vacina.status)}
                {vacina.doses_aplicadas != null && (
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {vacina.doses_aplicadas} doses
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

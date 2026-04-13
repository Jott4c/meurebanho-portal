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
        .from('vaccinations')
        .select('*')
        .eq('property_id', propertyId!)
        .order('application_date', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!propertyId,
  })

  if (isLoading) return <LoadingSpinner message="Carregando vacinas..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Registro de Vacinas</h1>
        <p className="text-sm text-neutral-500 mt-1">Acompanhe todas as vacinações realizadas no rebanho.</p>
      </div>

      {!vacinas || vacinas.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title="Nenhuma vacina registrada"
          description="Os registros de vacinação aparecerão aqui quando forem cadastrados."
        />
      ) : (
        <div className="grid gap-4">
          {vacinas.map((vacina: any) => (
            <div key={vacina.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary-50">
                  <Syringe size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{vacina.vaccine_type}</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Data da Aplicação: {new Date(vacina.application_date).toLocaleDateString('pt-BR')}
                    {vacina.next_dose_date && ` · Próxima Dose: ${new Date(vacina.next_dose_date).toLocaleDateString('pt-BR')}`}
                  </p>
                  {vacina.batch_number && <p className="text-xs text-neutral-400 mt-1">Lote: {vacina.batch_number}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={14} />
                  Realizada
                </span>
                {vacina.notes && (
                  <span className="text-xs text-neutral-400 max-w-[200px] truncate" title={vacina.notes}>
                    {vacina.notes}
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

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { AlertTriangle } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { OCCURRENCE_TYPE_LABELS, SEVERITY_LABELS } from '../../types'
import { useState } from 'react'

export default function Ocorrencias() {
  const { propertyId } = useAuth()
  const [filtroStatus, setFiltroStatus] = useState('')

  const { data: ocorrencias, isLoading } = useQuery({
    queryKey: ['ocorrencias', propertyId, filtroStatus],
    queryFn: async () => {
      let query = supabase
        .from('ocorrencias')
        .select('*, animais(brinco, nome)')
        .eq('property_id', propertyId!)
        .order('data_ocorrencia', { ascending: false })

      if (filtroStatus) {
        query = query.eq('status', filtroStatus)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    enabled: !!propertyId,
  })

  if (isLoading) return <LoadingSpinner message="Carregando ocorrências..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ocorrências</h1>
          <p className="text-sm text-neutral-500 mt-1">Registros sanitários e eventos do rebanho.</p>
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos os status</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="resolvido">Resolvido</option>
        </select>
      </div>

      {!ocorrencias || ocorrencias.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhuma ocorrência encontrada"
          description="Ocorrências registradas aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4">
          {ocorrencias.map((oc: any) => (
            <div key={oc.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${oc.status === 'em_andamento' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <AlertTriangle size={18} className={oc.status === 'em_andamento' ? 'text-amber-500' : 'text-emerald-500'} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {OCCURRENCE_TYPE_LABELS[oc.tipo] || oc.tipo}
                    </h3>
                    {oc.animais && (
                      <p className="text-xs text-neutral-500">{oc.animais.brinco} — {oc.animais.nome || 'Sem nome'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {oc.severidade && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      oc.severidade === 'grave' ? 'bg-red-100 text-red-700' :
                      oc.severidade === 'moderada' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {SEVERITY_LABELS[oc.severidade] || oc.severidade}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    oc.status === 'em_andamento' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {oc.status === 'em_andamento' ? 'Em Andamento' : 'Resolvido'}
                  </span>
                </div>
              </div>

              {oc.descricao && (
                <p className="text-sm text-neutral-600 mb-2">{oc.descricao}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span>Data: {new Date(oc.data_ocorrencia).toLocaleDateString('pt-BR')}</span>
                {oc.resolved_at && <span>Resolvido: {new Date(oc.resolved_at).toLocaleDateString('pt-BR')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

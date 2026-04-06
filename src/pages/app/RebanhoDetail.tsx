import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Beef } from 'lucide-react'
import { ANIMAL_CATEGORY_LABELS, ANIMAL_STATUS_LABELS } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function RebanhoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: animal, isLoading, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('animais').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  if (isLoading) return <LoadingSpinner message="Carregando dados do animal..." />

  if (error || !animal) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">Animal não encontrado.</p>
        <button onClick={() => navigate('/app/rebanho')} className="mt-4 text-primary-600 font-medium text-sm">Voltar ao rebanho</button>
      </div>
    )
  }

  const infoItem = (label: string, value?: string | null) => (
    <div>
      <dt className="text-xs text-neutral-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-neutral-900 mt-0.5">{value || '-'}</dd>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/rebanho')} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{animal.nome || animal.brinco}</h1>
            <p className="text-sm text-neutral-500">Brinco: {animal.brinco}</p>
          </div>
        </div>
        <Link to={`/app/rebanho/${id}/editar`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors">
          <Edit2 size={16} /> Editar
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Cabeçalho visual */}
        <div className="bg-gradient-to-r from-primary-600 to-emerald-500 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Beef size={32} className="text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{animal.nome || 'Sem nome'}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">Brinco: {animal.brinco}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
                {ANIMAL_STATUS_LABELS[animal.status] || animal.status}
              </span>
            </div>
          </div>
        </div>

        {/* Dados */}
        <div className="p-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {infoItem('Categoria', animal.categoria ? ANIMAL_CATEGORY_LABELS[animal.categoria] : null)}
            {infoItem('Sexo', animal.sexo === 'M' ? 'Macho' : animal.sexo === 'F' ? 'Fêmea' : null)}
            {infoItem('Raça', animal.raca)}
            {infoItem('Pelagem', animal.pelagem)}
            {infoItem('Data de Nascimento', animal.data_nascimento ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR') : null)}
            {infoItem('Cadastrado em', new Date(animal.created_at).toLocaleDateString('pt-BR'))}
          </dl>

          {animal.observacoes && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <h3 className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Observações</h3>
              <p className="text-sm text-neutral-700">{animal.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

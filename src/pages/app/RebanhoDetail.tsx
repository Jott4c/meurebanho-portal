import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePaddocks } from '../../hooks/usePaddocks'
import { useBatchUpdateAnimal } from '../../hooks/useAnimals'
import { supabase } from '../../lib/supabase'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Edit2, Beef, Calendar, MapPin, X,
  Dna, Activity, Weight, Droplets, Info, 
  Stethoscope, TrendingUp, AlertTriangle
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'
import { ANIMAL_CATEGORY_LABELS, ANIMAL_STATUS_LABELS, OCCURRENCE_TYPE_LABELS } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import OccurrenceModal from '../../components/OccurrenceModal'

type TabType = 'overview' | 'history'

export default function RebanhoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false)
  const [isManejoOpen, setIsManejoOpen] = useState(false)

  // Main Animal Query
  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('animals').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const queryClient = useQueryClient()
  const { data: paddocks } = usePaddocks()
  const batchUpdateMutation = useBatchUpdateAnimal()

  const handleManejo = (newPaddockId: string | null) => {
    batchUpdateMutation.mutate({
      ids: [id!],
      updates: { paddock_id: newPaddockId || undefined }
    }, {
      onSuccess: () => {
        setIsManejoOpen(false)
        queryClient.invalidateQueries({ queryKey: ['animal', id] })
      }
    })
  }

  // Occurrences Query
  const { data: occurrences } = useQuery({
    queryKey: ['animal-occurrences', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .eq('animal_id', id!)
        .order('occurred_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  // Weights Query
  const { data: weights } = useQuery({
    queryKey: ['animal-weights', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('animal_weights')
        .select('*')
        .eq('animal_id', id!)
        .order('date', { ascending: true }) // Ascending for charts
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  // Milk Query
  const { data: milk } = useQuery({
    queryKey: ['animal-milk', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milk_productions')
        .select('*')
        .eq('animal_id', id!)
        .order('date', { ascending: true }) // Ascending for charts
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  // Derived Stats

  // Derived Stats
  const stats = useMemo(() => {
    if (!milk || milk.length === 0) return { avgMilk: 0 }
    const total = milk.reduce((sum, m) => sum + Number(m.liters || 0), 0)
    return {
      avgMilk: (total / milk.length).toFixed(1)
    }
  }, [milk])

  const chartData = useMemo(() => {
    const weightsData = (weights || []).map(w => ({
      date: new Date(w.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: Number(w.weight)
    }))

    const milkData = (milk || []).map(m => ({
      date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      liters: Number(m.liters)
    }))

    return { weightsData, milkData }
  }, [weights, milk])

  if (isLoadingAnimal) return <LoadingSpinner />
  if (!animal) return <div className="p-8 text-center text-neutral-500">Animal não encontrado.</div>

  const currentPaddock = paddocks?.find(p => p.id === animal.paddock_id)?.name || animal.paddock || 'Não definido'
  const latestWeight = weights?.length ? `${weights[weights.length - 1].weight} kg` : '-'

  const timelineItems = [
    ...(occurrences || []).map(o => ({
      type: 'occurrence',
      date: o.occurred_at,
      title: OCCURRENCE_TYPE_LABELS[o.occurrence_type] || o.occurrence_type,
      description: o.description,
      icon: <Stethoscope size={16} />,
      color: 'blue'
    })),
    ...(weights || []).map(w => ({
      type: 'weight',
      date: w.date,
      title: `Pesagem: ${w.weight} kg`,
      description: 'Registro de peso corporal',
      icon: <Weight size={16} />,
      color: 'emerald'
    })),
    ...(milk || []).map(m => ({
      type: 'milk',
      date: m.date,
      title: `Produção: ${m.liters} L`,
      description: `Ordenha - ${m.period === 'morning' ? 'Manhã' : m.period === 'afternoon' ? 'Tarde' : 'Dia Todo'}`,
      icon: <Droplets size={16} />,
      color: 'blue'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/rebanho')} 
            className="p-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft size={20} className="text-neutral-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-neutral-900 truncate">Animal {animal.ear_tag}</h1>
            <p className="text-xs text-neutral-500 font-medium tracking-tight">Status: {ANIMAL_STATUS_LABELS[animal.status] || animal.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isManejoOpen ? (
            <button 
              onClick={() => setIsManejoOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <MapPin size={16} className="text-primary-600" /> 
              <span className="hidden sm:inline">Manejo</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
               <select
                onChange={(e) => handleManejo(e.target.value === 'null' ? null : e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-800 text-sm font-bold py-2.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                defaultValue=""
              >
                <option value="" disabled>Mover para...</option>
                <option value="null">Sem Piquete</option>
                {paddocks?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsManejoOpen(false)}
                className="p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-400 border border-neutral-200"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsOccurrenceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            <AlertTriangle size={16} className="text-amber-500" /> 
            <span className="hidden sm:inline">Ocorrência</span>
          </button>
          <Link 
            to={`/app/rebanho/${id}/editar`} 
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-200 transition-all font-inter"
          >
            <Edit2 size={16} /> 
            <span className="hidden sm:inline">Editar Brinco</span>
          </Link>
        </div>
      </div>

      {/* Main Card / Hero */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 sm:p-10 relative overflow-hidden">
          {/* Abstract pattern bg */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <Beef size={48} className="text-white opacity-90" />
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest">
                  {ANIMAL_CATEGORY_LABELS[animal.category] || animal.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  animal.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-300'
                }`}>
                  {ANIMAL_STATUS_LABELS[animal.status] || animal.status}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-1">Brinco {animal.ear_tag}</h2>
              <p className="text-neutral-400 text-sm font-medium">Cadastrado em {new Date(animal.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
              {animal.sex === 'F' && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <p className="text-neutral-400 text-[10px] font-bold uppercase mb-1">Média Ordenha</p>
                  <p className="text-blue-400 text-xl font-black">{stats.avgMilk}L</p>
                </div>
              )}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-neutral-400 text-[10px] font-bold uppercase mb-1">Último Peso</p>
                <p className="text-white text-xl font-black">{latestWeight}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center sm:col-span-2">
                <p className="text-neutral-400 text-[10px] font-bold uppercase mb-1">Sexo</p>
                <p className="text-white text-xl font-black">{animal.sex === 'M' ? 'Macho' : 'Fêmea'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-100">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'overview' ? 'border-primary-600 text-primary-600 bg-primary-50/10' : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'history' ? 'border-primary-600 text-primary-600 bg-primary-50/10' : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Histórico e Timeline
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="p-6 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Info Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter">
              {/* Basic Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-neutral-100 rounded-lg">
                    <Info size={16} className="text-neutral-600" />
                  </div>
                  <h3 className="font-black text-neutral-900 uppercase text-xs tracking-wider">Identificação</h3>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                  <DetailItem label="Brinco" value={animal.ear_tag} />
                  <DetailItem label="RFID / Tag Eletrônica" value={animal.rfid_tag || 'Não cadastrado'} />
                  <DetailItem label="ID Visual" value={animal.visual_id || 'Não cadastrado'} />
                  <DetailItem label="ID PNIB" value={animal.pnib_id || 'Não cadastrado'} />
                  <DetailItem label="Lote / Manejo" value={animal.batch_id || '-'} />
                </div>
              </section>

              {/* Origin / Genetics */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-neutral-100 rounded-lg">
                    <Dna size={16} className="text-neutral-600" />
                  </div>
                  <h3 className="font-black text-neutral-900 uppercase text-xs tracking-wider">Genealogia e Origem</h3>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                  <DetailItem label="Raça" value={animal.breed || 'Não informada'} />
                  <DetailItem label="Pelagem / Cor" value={animal.color || '-'} />
                  <DetailItem label="Data de Nascimento" value={animal.birth_date ? new Date(animal.birth_date).toLocaleDateString('pt-BR') : 'Desconhecida'} />
                  <DetailItem label="Mãe (Ear Tag)" value={animal.mother_id || '-'} />
                  <DetailItem label="Pai (Ear Tag)" value={animal.father_id || '-'} />
                </div>
              </section>

              {/* Location */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-neutral-100 rounded-lg">
                    <MapPin size={16} className="text-neutral-600" />
                  </div>
                  <h3 className="font-black text-neutral-900 uppercase text-xs tracking-wider">Localização</h3>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                  <DetailItem 
                    label="Piquete Atual" 
                    value={currentPaddock} 
                    highlight
                  />
                  <DetailItem label="Entrada no Piquete" value={animal.paddock_entry_date ? new Date(animal.paddock_entry_date).toLocaleDateString('pt-BR') : '-'} />
                </div>
              </section>

              {/* Health/Withdrawal */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-neutral-100 rounded-lg">
                    <Activity size={16} className="text-neutral-600" />
                  </div>
                  <h3 className="font-black text-neutral-900 uppercase text-xs tracking-wider">Saúde e Manejo</h3>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                  <DetailItem 
                    label="Carência de Medicamentos" 
                    value={animal.withdrawal_until ? `Até ${new Date(animal.withdrawal_until).toLocaleDateString('pt-BR')}` : 'Sem restrição'} 
                    status={animal.withdrawal_until ? 'warning' : 'success'}
                  />
                  <DetailItem label="Data do Status" value={animal.status_date ? new Date(animal.status_date).toLocaleDateString('pt-BR') : '-'} />
                </div>
              </section>
            </div>

            {/* Performance Charts Section */}
            <div className="space-y-6 pt-6 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary-100 rounded-lg">
                    <TrendingUp size={16} className="text-primary-600" />
                  </div>
                  <h3 className="font-black text-neutral-900 uppercase text-xs tracking-wider">Performance e Crescimento</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight Evolution */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">Evolução do Peso</h4>
                      <p className="text-[10px] text-neutral-500 font-medium font-inter uppercase">Histórico de Pesagens (kg)</p>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Weight size={18} />
                    </div>
                  </div>
                  <div className="h-[200px] w-full">
                    {chartData.weightsData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.weightsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#a3a3a3', fontWeight: 600 }}
                          />
                          <YAxis 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#a3a3a3', fontWeight: 600 }}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ fontWeight: 800, color: '#171717', marginBottom: '4px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                        <Weight size={24} className="mb-2 opacity-20" />
                        <p className="text-xs font-bold">Dados insuficientes para gráfico</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Milk Evolution (Only for females) */}
                {animal.sex === 'F' && (
                  <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">Produção de Leite</h4>
                        <p className="text-[10px] text-neutral-500 font-medium font-inter uppercase">Histórico de Ordenha (L)</p>
                      </div>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Droplets size={18} />
                      </div>
                    </div>
                    <div className="h-[200px] w-full">
                      {chartData.milkData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.milkData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="date" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              tick={{ fill: '#a3a3a3', fontWeight: 600 }}
                            />
                            <YAxis 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              tick={{ fill: '#a3a3a3', fontWeight: 600 }}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              labelStyle={{ fontWeight: 800, color: '#171717', marginBottom: '4px' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="liters" 
                              stroke="#3b82f6" 
                              strokeWidth={3} 
                              dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                          <Droplets size={24} className="mb-2 opacity-20" />
                          <p className="text-xs font-bold">Dados insuficientes para gráfico</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {animal.status_reason && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-black text-amber-800 uppercase mb-1">Observações do Status</h4>
                <p className="text-sm text-amber-900">{animal.status_reason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {timelineItems.length > 0 ? (
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-neutral-200 before:via-neutral-200 before:to-transparent">
                {timelineItems.map((item, index) => (
                  <div key={index} className="relative flex items-center group">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 z-10 transition-transform group-hover:scale-110 ${
                      item.color === 'emerald' ? 'bg-emerald-500 text-white' :
                      item.color === 'blue' ? 'bg-primary-500 text-white' :
                      'bg-neutral-500 text-white'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="ml-6 flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-100 hover:border-neutral-200 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-neutral-900 text-sm">{item.title}</h4>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{item.description || 'Nenhuma observação registrada.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                  <Calendar size={24} className="text-neutral-300" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Nenhum histórico encontrado</h3>
                <p className="text-xs text-neutral-500 mt-1">Este animal ainda não possui registros de manejo ou eventos históricos.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <OccurrenceModal 
        open={isOccurrenceModalOpen}
        onClose={() => setIsOccurrenceModalOpen(false)}
        animalId={id!}
        animalEarTag={animal.ear_tag}
      />
    </div>
  )
}

function DetailItem({ label, value, highlight = false, status }: { label: string, value: string | null | undefined, highlight?: boolean, status?: 'success' | 'warning' | 'danger' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-bold text-neutral-400 uppercase tracking-tight">{label}</span>
      <span className={`text-sm font-black ${
        highlight ? 'text-primary-600' : 
        status === 'success' ? 'text-emerald-600' :
        status === 'warning' ? 'text-amber-600' :
        status === 'danger' ? 'text-red-600' :
        'text-neutral-800'
      }`}>
        {value || '-'}
      </span>
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  AlertTriangle, Plus, Search, Trash2, 
  ChevronRight, Calendar, User, Activity, 
  ArrowRight,
  Stethoscope, Clock, Shield, Eye, X
} from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { OCCURRENCE_TYPE_LABELS, SEVERITY_LABELS } from '../../types'
import { Link } from 'react-router-dom'
import OccurrenceModal from '../../components/OccurrenceModal'
import ConfirmModal from '../../components/ConfirmModal'

export default function Ocorrencias() {
  const { propertyId } = useAuth()
  const queryClient = useQueryClient()
  
  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Query
  const { data: ocorrencias, isLoading } = useQuery({
    queryKey: ['ocorrencias', propertyId, typeFilter, severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('occurrences')
        .select(`
          *,
          animals (
            id,
            ear_tag,
            category
          ),
          employees (
            name
          )
        `)
        .eq('property_id', propertyId!)

      if (typeFilter) query = query.eq('occurrence_type', typeFilter)
      if (severityFilter) query = query.eq('severity', severityFilter)

      query = query.order('occurred_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    enabled: !!propertyId,
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('occurrences').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
      setDeleteId(null)
    }
  })

  // Filtered data (client side search)
  const filteredOcorrencias = ocorrencias?.filter(oc => {
    const earTagMatch = oc.animals?.ear_tag?.toLowerCase().includes(searchTerm.toLowerCase())
    const descMatch = oc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return earTagMatch || descMatch
  })

  if (isLoading) return <LoadingSpinner message="Sincronizando registros sanitários..." />

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'grave': return 'bg-red-50 text-red-600 border-red-100'
      case 'moderado': return 'bg-amber-50 text-amber-600 border-amber-100'
      default: return 'bg-blue-50 text-blue-600 border-blue-100'
    }
  }

  const getOccurrenceIcon = (type: string) => {
    if (['vacinacao', 'vermifugacao'].includes(type)) return <Shield size={18} className="text-emerald-500" />
    if (['doenca', 'mastite', 'bicheira'].includes(type)) return <Stethoscope size={18} className="text-red-500" />
    return <Activity size={18} className="text-primary-500" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 leading-tight">Painel de Ocorrências</h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Total de {ocorrencias?.length || 0} registros encontrados
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-neutral-900/10 active:scale-95"
        >
          <Plus size={20} />
          REGISTRAR EVENTO
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar por brinco ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm shadow-sm transition-all"
          />
        </div>

        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full px-5 py-4 bg-white border border-neutral-200 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm shadow-sm transition-all appearance-none"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(OCCURRENCE_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select 
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="w-full px-5 py-4 bg-white border border-neutral-200 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm shadow-sm transition-all appearance-none"
        >
          <option value="">Todas as gravidades</option>
          {Object.entries(SEVERITY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <button 
          onClick={() => {
            setSearchTerm('')
            setTypeFilter('')
            setSeverityFilter('')
          }}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-3xl font-bold text-sm transition-all"
        >
          LIMPAR FILTROS
        </button>
      </div>

      {/* List content */}
      {!filteredOcorrencias || filteredOcorrencias.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhuma ocorrência aqui"
          description="Ajuste os filtros ou registre um novo evento sanitário."
        />
      ) : (
        <div className="grid gap-4">
          {filteredOcorrencias.map((oc: any) => (
            <div 
              key={oc.id} 
              className="group bg-white rounded-3xl border border-neutral-200 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-xl hover:shadow-neutral-200/50 hover:border-primary-200"
            >
              {/* Type Icon & Severity */}
              <div className="flex flex-row md:flex-col items-center gap-4 min-w-[120px]">
                <div className={`p-4 rounded-[2rem] ${getSeverityColor(oc.severity)} border transition-all`}>
                  {getOccurrenceIcon(oc.occurrence_type)}
                </div>
                {oc.severity && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getSeverityColor(oc.severity)}`}>
                    {SEVERITY_LABELS[oc.severity]}
                  </span>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-black text-neutral-900">
                    {OCCURRENCE_TYPE_LABELS[oc.occurrence_type] || oc.occurrence_type}
                  </h3>
                  <div className="h-1 w-1 bg-neutral-300 rounded-full hidden sm:block" />
                  <Link 
                    to={`/app/rebanho/${oc.animal_id}`}
                    className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-black transition-colors"
                  >
                    BRINCO {oc.animals?.ear_tag}
                    <ChevronRight size={12} />
                  </Link>
                </div>

                <p className="text-neutral-600 text-sm font-medium leading-relaxed max-w-2xl">
                  {oc.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
                    <Calendar size={14} className="text-neutral-300" />
                    {new Date(oc.occurred_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
                    <Clock size={14} className="text-neutral-300" />
                    Registrado às {new Date(oc.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
                    <User size={14} className="text-neutral-300" />
                    Por {oc.employees?.name || 'Sistema'}
                  </div>
                </div>
              </div>

              {/* Photo Preview */}
              {oc.photo_url && !oc.photo_url.startsWith('file://') && (
                <div className="shrink-0">
                  <div 
                    onClick={() => setSelectedPhoto(oc.photo_url)}
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border border-neutral-200 shadow-sm group/photo cursor-pointer"
                  >
                    <img 
                      src={oc.photo_url} 
                      alt="Registro" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye size={20} className="text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-start md:items-center gap-2">
                <Link
                  to={`/app/ocorrencias/${oc.id}`}
                  className="p-3 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-2xl transition-all"
                  title="Ver Detalhes"
                >
                  <ArrowRight size={20} />
                </Link>
                <button 
                  onClick={() => setDeleteId(oc.id)}
                  className="p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <OccurrenceModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <ConfirmModal
        open={!!deleteId}
        title="Excluir Ocorrência?"
        message="Esta ação não pode ser desfeita e o registro será removido permanentemente do histórico do animal."
        confirmLabel="EXCLUIR REGISTRO"
        variant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {/* Photo Zoom Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-200">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedPhoto} 
            alt="Zoom" 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" 
          />
        </div>
      )}
    </div>
  )
}

import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { 
  ArrowLeft, Calendar, User, Activity, 
  Stethoscope, FileText, Trash2, Tag, 
  ChevronRight, Clock,
  AlertCircle, Shield, Camera, Image as ImageIcon,
  X
} from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { OCCURRENCE_TYPE_LABELS, SEVERITY_LABELS } from '../../types'
import { useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'

export default function OcorrenciaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Query Occurrence Details
  const { data: occurrence, isLoading, error } = useQuery({
    queryKey: ['occurrence', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select(`
          *,
          animals (
            *
          ),
          employees (
            name,
            role
          ),
          treatments (
            *
          )
        `)
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('occurrences').delete().eq('id', id!)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
      navigate('/app/ocorrencias')
    }
  })

  if (isLoading) return <LoadingSpinner message="Carregando detalhes da ocorrência..." />
  if (error || !occurrence) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="p-6 bg-red-50 rounded-full text-red-500">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-xl font-black text-neutral-900">Ocorrência não encontrada</h2>
      <p className="text-neutral-500 font-medium">O registro pode ter sido removido ou o link está incorreto.</p>
      <Link 
        to="/app/ocorrencias" 
        className="px-6 py-3 bg-neutral-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-neutral-800 transition-all"
      >
        <ArrowLeft size={18} />
        VOLTAR PARA LISTA
      </Link>
    </div>
  )

  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'grave': return { bg: 'bg-red-500', text: 'text-red-500', lightBg: 'bg-red-50', border: 'border-red-100' }
      case 'moderado': return { bg: 'bg-amber-500', text: 'text-amber-500', lightBg: 'bg-amber-50', border: 'border-amber-100' }
      default: return { bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-100' }
    }
  }

  const severityStyle = getSeverityStyle(occurrence.severity)
  const hasTreatments = occurrence.treatments && occurrence.treatments.length > 0

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button 
          onClick={() => navigate('/app/ocorrencias')}
          className="group flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-black text-xs uppercase tracking-widest transition-all"
        >
          <div className="p-2 bg-white rounded-xl border border-neutral-100 shadow-sm group-hover:bg-neutral-50 transition-colors">
            <ArrowLeft size={18} />
          </div>
          Voltar para Lista
        </button>

        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-widest transition-all p-2 hover:bg-red-50 rounded-xl"
        >
          <Trash2 size={18} />
          Excluir Registro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
            {/* Type Header */}
            <div className={`p-8 ${severityStyle.lightBg} border-b ${severityStyle.border} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
              <div className="flex items-center gap-5">
                <div className={`p-4 ${severityStyle.bg} text-white rounded-3xl shadow-lg shadow-${severityStyle.text.split('-')[1]}-500/20`}>
                  <Activity size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-neutral-900 leading-tight">
                    {OCCURRENCE_TYPE_LABELS[occurrence.occurrence_type] || occurrence.occurrence_type}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${severityStyle.bg} text-white`}>
                      Nível: {SEVERITY_LABELS[occurrence.severity] || 'Padrão'}
                    </span>
                    <div className="flex items-center gap-1.5 text-neutral-400 font-bold text-[10px] uppercase tracking-wider">
                      <Clock size={12} />
                      ID #{occurrence.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} />
                  Descrição da Ocorrência
                </h3>
                <p className="text-lg text-neutral-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {occurrence.description || "Nenhuma observação detalhada foi fornecida para este registro."}
                </p>
              </div>

              {/* Photo Evidence */}
              {occurrence.photo_url && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera size={14} />
                    Evidência Fotográfica
                  </h3>
                  <div 
                    onClick={() => setSelectedPhoto(occurrence.photo_url)}
                    className="relative group rounded-[2rem] overflow-hidden border border-neutral-100 shadow-xl cursor-zoom-in aspect-video max-h-[400px]"
                  >
                    <img 
                      src={occurrence.photo_url} 
                      alt="Evidência" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-6 py-3 bg-white text-neutral-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                        <ImageIcon size={18} />
                        Ver em Tela Cheia
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Treatments Section */}
          {hasTreatments && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                <Shield size={18} className="text-emerald-500" />
                Tratamentos Aplicados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {occurrence.treatments.map((t: any) => (
                  <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Stethoscope size={20} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-neutral-900">{t.medication_name}</h4>
                      <p className="text-sm text-neutral-500 font-bold mt-0.5">Dosagem: {t.dosage}</p>
                      <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-black uppercase mt-3 tracking-widest">
                        <Calendar size={12} />
                        Aplicado em: {new Date(t.applied_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Context Sidebar */}
        <div className="space-y-6">
          {/* Target Animal Card */}
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Tag size={120} />
            </div>
            
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Animal Vinculado</h3>
            
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                {occurrence.animals?.photo_url ? (
                  <img src={occurrence.animals.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-neutral-300" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1 pointer-events-none">BRINCO</p>
                <p className="text-3xl font-black text-neutral-900 leading-none">{occurrence.animals?.ear_tag}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-[10px] font-bold text-neutral-600 uppercase">
                    {occurrence.animals?.category}
                  </span>
                </div>
              </div>
            </div>

            <Link 
              to={`/app/rebanho/${occurrence.animals?.id}`}
              className="flex items-center justify-between w-full p-4 bg-neutral-50 hover:bg-neutral-100 rounded-2xl transition-all border border-neutral-100 group"
            >
              <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Ver Perfil Completo</span>
              <ChevronRight size={18} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Registration Info */}
          <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white space-y-6 relative shadow-xl shadow-neutral-900/20">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Auditoria do Registro</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-xl text-neutral-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Cadastrado por</p>
                  <p className="text-sm font-black text-white mt-1">{occurrence.employees?.name || 'Administrador do Sistema'}</p>
                  <p className="text-[10px] text-neutral-400 font-bold mt-0.5">{occurrence.employees?.role || 'Acesso Direto'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-xl text-neutral-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Data da Ocorrência</p>
                  <p className="text-sm font-black text-white mt-1">
                    {new Date(occurrence.occurred_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-xl text-neutral-400">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Data do Registro</p>
                  <p className="text-sm font-black text-white mt-1">
                    {new Date(occurrence.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[200] bg-neutral-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-8 right-8 p-3 text-white/50 hover:text-white transition-colors"
          >
            <X size={40} strokeWidth={1.5} />
          </button>
          
          <img 
            src={selectedPhoto} 
            alt="Evidência Ampliada" 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" 
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Excluir Ocorrência"
        message="Tem certeza que deseja excluir permanentemente este registro sanitário? Esta ação não poderá ser desfeita."
        confirmLabel={deleteMutation.isPending ? 'Excluindo...' : "Sim, Excluir Registro"}
        variant="danger"
      />
    </div>
  )
}

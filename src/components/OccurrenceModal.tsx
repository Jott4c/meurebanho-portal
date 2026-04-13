import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Loader2, X, AlertTriangle, Calendar, FileText, 
  Activity, Weight, User, Camera, Image as ImageIcon,
  Trash2, Plus
} from 'lucide-react'
import { OCCURRENCE_TYPE_LABELS, SEVERITY_LABELS } from '../types'
import { useState, useRef } from 'react'

const occurrenceSchema = z.object({
  occurrence_type: z.string().min(1, 'Tipo é obrigatório'),
  severity: z.string().optional(),
  occurred_at: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  weight: z.string().optional(),
  medication_name: z.string().optional(),
  dosage: z.string().optional(),
  selected_animal_id: z.string().optional(),
  employee_id: z.string().optional(),
  photo_url: z.string().optional(),
})

type OccurrenceFormData = z.infer<typeof occurrenceSchema>

interface OccurrenceModalProps {
  open: boolean
  onClose: () => void
  animalId?: string
  animalEarTag?: string
}

export default function OccurrenceModal({ open, onClose, animalId, animalEarTag }: OccurrenceModalProps) {
  const { propertyId, user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for photo upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch current employee profile
  const { data: currentEmployee } = useQuery({
    queryKey: ['current-employee', propertyId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('property_id', propertyId!)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user && !!propertyId
  })

  // Fetch animals only if animalId is NOT provided
  const { data: animals } = useQuery({
    queryKey: ['active-animals-list', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('animals')
        .select('id, ear_tag')
        .eq('property_id', propertyId!)
        .eq('status', 'active')
        .order('ear_tag', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!open && !animalId && !!propertyId
  })

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      occurred_at: new Date().toISOString().split('T')[0],
      severity: 'leve'
    }
  })

  // Dynamic field tracking
  const type = watch('occurrence_type')
  const isHealth = ['doenca', 'bicheira', 'mastite', 'casco', 'ferimento'].includes(type)
  const isSanitary = ['vacinacao', 'vermifugacao'].includes(type)
  const isWeight = type === 'pesagem'
  const isDeath = type === 'morte'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const mutation = useMutation({
    mutationFn: async (data: OccurrenceFormData) => {
      if (!propertyId) throw new Error('Propriedade não selecionada')
      const targetAnimalId = animalId || data.selected_animal_id
      if (!targetAnimalId) throw new Error('Animal é obrigatório')

      // Ensure date has time information for timestamp columns if needed
      const occurredAtFormatted = data.occurred_at.includes('T') 
        ? data.occurred_at 
        : `${data.occurred_at}T${new Date().toLocaleTimeString('pt-BR', { hour12: false })}`

      // 1. Upload photo if selected
      let photoUrl = data.photo_url || null

      if (selectedFile) {
        setIsUploading(true)
        try {
          const fileExt = selectedFile.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `occurrences/${propertyId}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, selectedFile)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath)

          photoUrl = publicUrl
        } finally {
          setIsUploading(false)
        }
      }

      // 2. Create main occurrence
      const { data: occurrence, error: occError } = await supabase.from('occurrences').insert({
        occurrence_type: data.occurrence_type,
        severity: (isHealth || isSanitary) ? (data.severity || 'leve') : null,
        description: data.description || null,
        occurred_at: occurredAtFormatted,
        animal_id: targetAnimalId,
        property_id: propertyId,
        employee_id: currentEmployee?.id || null,
        photo_url: photoUrl,
      }).select().single()

      if (occError) {
        console.error('Erro detalhado Supabase:', occError)
        alert(`Erro ao salvar: ${occError.message}`)
        throw occError
      }

      // 2. Conditional: Treatement
      if (data.medication_name && (isHealth || isSanitary)) {
        const { error: treatError } = await supabase.from('treatments').insert({
          occurrence_id: occurrence.id,
          medication_name: data.medication_name,
          dosage: data.dosage,
          applied_at: data.occurred_at,
        })
        if (treatError) throw treatError
      }

      // 3. Conditional: Weight
      if (data.weight && isWeight) {
        const { error: weightError } = await supabase.from('animal_weights').insert({
          animal_id: targetAnimalId,
          property_id: propertyId,
          weight: parseFloat(data.weight),
          date: data.occurred_at,
        })
        if (weightError) throw weightError
      }

      // 4. Conditional: Animal Status Update (Death)
      if (isDeath) {
        const { error: animalError } = await supabase.from('animals').update({
          status: 'dead',
          status_date: data.occurred_at,
          status_reason: data.description
        }).eq('id', targetAnimalId)
        if (animalError) throw animalError
      }
    },
    onSuccess: (_, variables) => {
      const targetId = animalId || variables.selected_animal_id
      queryClient.invalidateQueries({ queryKey: ['animal-occurrences', targetId] })
      queryClient.invalidateQueries({ queryKey: ['animal-weights', targetId] })
      queryClient.invalidateQueries({ queryKey: ['animal', targetId] })
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] })
      reset()
      removePhoto()
      onClose()
    }
  })

  if (!open) return null

  const inputClass = "w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold placeholder:font-medium placeholder:text-neutral-300 transition-all text-sm"
  const selectClass = "w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all text-sm appearance-none"
  const labelClass = "block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2 px-2"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => !mutation.isPending && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="px-8 pt-8 pb-6 flex justify-between items-start border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Registro Dinâmico</span>
            </div>
            <h2 className="text-2xl font-black text-neutral-900 leading-tight">Nova Ocorrência</h2>
            {animalEarTag ? (
              <p className="text-sm text-neutral-500 mt-1 font-medium">Animal: Brinco <span className="text-neutral-900 font-bold">{animalEarTag}</span></p>
            ) : (
              <p className="text-sm text-neutral-500 mt-1 font-medium">Selecione um animal para o registro</p>
            )}
          </div>
          <button 
            disabled={mutation.isPending}
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-neutral-100 text-neutral-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {!animalId && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className={labelClass}>Animal (Brinco)</label>
                <div className="relative">
                  <select {...register('selected_animal_id')} className={selectClass}>
                    <option value="">Selecione o animal</option>
                    {animals?.map(a => (
                      <option key={a.id} value={a.id}>{a.ear_tag}</option>
                    ))}
                  </select>
                </div>
                {errors.selected_animal_id && <p className="text-[10px] text-red-500 mt-1 font-bold px-2">{errors.selected_animal_id.message}</p>}
              </div>
            )}

            <div>
              <label className={labelClass}>Tipo do Evento *</label>
              <div className="relative">
                <select {...register('occurrence_type')} className={selectClass}>
                  <option value="">Selecione o tipo de evento</option>
                  {Object.entries(OCCURRENCE_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <Activity size={16} />
                </div>
              </div>
              {errors.occurrence_type && <p className="text-[10px] text-red-500 mt-1 font-bold px-2">{errors.occurrence_type.message}</p>}
            </div>

            {/* Conditional Fields: Health/Sanitary */}
            {(isHealth || isSanitary) && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                {isHealth && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Gravidade</label>
                    <select {...register('severity')} className={selectClass}>
                      {Object.entries(SEVERITY_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={isHealth ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                  <label className={labelClass}>Medicamento / Produto</label>
                  <input type="text" {...register('medication_name')} placeholder="Ex: Mastifin, Vacina X" className={inputClass.replace('pl-12', 'px-5')} />
                </div>
                {(isHealth || isSanitary) && (
                  <div className="col-span-2">
                    <label className={labelClass}>Dosagem / Aplicação</label>
                    <input type="text" {...register('dosage')} placeholder="Ex: 5ml, 1 dose" className={inputClass.replace('pl-12', 'px-5')} />
                  </div>
                )}
              </div>
            )}

            {/* Conditional Fields: Weight */}
            {isWeight && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className={labelClass}>Peso Corporal (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input type="number" step="0.1" {...register('weight')} placeholder="Ex: 450.5" className={inputClass} />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Data do Evento *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input type="date" {...register('occurred_at')} className={inputClass} />
              </div>
              {errors.occurred_at && <p className="text-[10px] text-red-500 mt-1 font-bold px-2">{errors.occurred_at.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Descrição / Observações</label>
              <div className="relative">
                <FileText className="absolute left-4 top-5 text-neutral-400" size={18} />
                <textarea 
                  {...register('description')} 
                  rows={3} 
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold placeholder:font-medium placeholder:text-neutral-300 transition-all text-sm resize-none"
                  placeholder="Descreva detalhes adicionais sobre o ocorrido..."
                />
              </div>
              {errors.description && <p className="text-[10px] text-red-500 mt-1 font-bold px-2">{errors.description.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Evidência Fotográfica</label>
              
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 py-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-3xl hover:bg-neutral-100/50 hover:border-primary-500/50 transition-all group"
                >
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-neutral-400 group-hover:text-primary-500 transition-colors">
                    <Camera size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-neutral-600">Clique para enviar uma foto</p>
                    <p className="text-[10px] font-medium text-neutral-400 mt-1 uppercase tracking-wider">JPG, PNG ou HEIC • Max 10MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative group rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-video flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-white text-neutral-900 rounded-2xl hover:bg-neutral-100 transition-colors shadow-xl"
                      title="Trocar Foto"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-xl"
                      title="Remover Foto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isDeath && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 animate-in pulse duration-1000">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <p className="text-xs text-red-800 font-bold leading-tight">
                  Atenção: Ao salvar esta ocorrência, o status do animal será alterado para "MORTO" e ele não aparecerá mais nos relatórios de rebanho ativo.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || (!!user && !currentEmployee && !propertyId)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-neutral-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
            >
              {mutation.isPending || isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isUploading ? 'ENVIANDO FOTO...' : 'SALVANDO...'}
                </>
              ) : (
                <>
                  CONFIRMAR REGISTRO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

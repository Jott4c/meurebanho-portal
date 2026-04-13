import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

const animalSchema = z.object({
  ear_tag: z.string().min(1, 'Brinco é obrigatório'),
  category: z.enum(['vaca', 'touro', 'novilha', 'novilho', 'bezerro', 'bezerra']),
  sex: z.enum(['M', 'F']),
  breed: z.string().optional(),
  color: z.string().optional(),
  birth_date: z.string().optional(),
})

type AnimalFormData = z.infer<typeof animalSchema>

export default function RebanhoForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const { propertyId } = useAuth()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
  })

  const { data: existingAnimal, isLoading: loadingAnimal } = useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('animals').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
    enabled: isEditing,
  })

  useEffect(() => {
    if (existingAnimal) {
      reset({
        ear_tag: existingAnimal.ear_tag,
        category: existingAnimal.category || '',
        sex: existingAnimal.sex || undefined,
        breed: existingAnimal.breed || '',
        color: existingAnimal.color || '',
        birth_date: existingAnimal.birth_date || '',
      })
    }
  }, [existingAnimal, reset])

  const mutation = useMutation({
    mutationFn: async (formData: AnimalFormData) => {
      const payload = { ...formData, property_id: propertyId }
      if (isEditing) {
        const { error } = await supabase.from('animals').update({ ear_tag: formData.ear_tag }).eq('id', id!)
        if (error) throw error
      } else {
        const { error } = await supabase.from('animals').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/app/rebanho')
    },
  })

  if (isEditing && loadingAnimal) return <LoadingSpinner message="Carregando dados do animal..." />

  const fieldClass = "w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all bg-white disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed"
  const labelClass = "block text-sm font-medium text-neutral-700 mb-1"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/rebanho')} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{isEditing ? 'Editar Animal' : 'Novo Animal'}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{isEditing ? 'Atualize os dados do animal.' : 'Preencha os dados para cadastrar um novo animal.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
        {mutation.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            Erro ao salvar: {(mutation.error as Error).message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Brinco *</label>
            <input {...register('ear_tag')} className={fieldClass} placeholder="Ex: 001" />
            {errors.ear_tag && <p className="text-xs text-red-500 mt-1">{errors.ear_tag.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Categoria *</label>
            <select {...register('category')} className={fieldClass} disabled={isEditing}>
              <option value="">Selecione</option>
              <option value="vaca">Vaca</option>
              <option value="touro">Touro</option>
              <option value="bezerro">Bezerro</option>
              <option value="bezerra">Bezerra</option>
              <option value="novilha">Novilha</option>
              <option value="novilho">Novilho</option>
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Sexo *</label>
            <select {...register('sex')} className={fieldClass} disabled={isEditing}>
              <option value="">Selecione</option>
              <option value="M">Macho</option>
              <option value="F">Fêmea</option>
            </select>
            {errors.sex && <p className="text-xs text-red-500 mt-1">{errors.sex.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Raça</label>
            <input {...register('breed')} className={fieldClass} placeholder="Ex: Nelore" disabled={isEditing} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pelagem/Cor</label>
            <input {...register('color')} className={fieldClass} placeholder="Ex: Branca" disabled={isEditing} />
          </div>
          <div>
            <label className={labelClass}>Data de Nascimento</label>
            <input type="date" {...register('birth_date')} className={fieldClass} disabled={isEditing} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/app/rebanho')} className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-70">
            {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Animal'}
          </button>
        </div>
      </form>
    </div>
  )
}

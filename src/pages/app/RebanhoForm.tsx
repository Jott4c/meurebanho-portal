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
  brinco: z.string().min(1, 'Brinco é obrigatório'),
  nome: z.string().optional(),
  categoria: z.string().optional(),
  sexo: z.enum(['M', 'F']).optional(),
  raca: z.string().optional(),
  pelagem: z.string().optional(),
  data_nascimento: z.string().optional(),
  observacoes: z.string().optional(),
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
      const { data, error } = await supabase.from('animais').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
    enabled: isEditing,
  })

  useEffect(() => {
    if (existingAnimal) {
      reset({
        brinco: existingAnimal.brinco,
        nome: existingAnimal.nome || '',
        categoria: existingAnimal.categoria || '',
        sexo: existingAnimal.sexo || undefined,
        raca: existingAnimal.raca || '',
        pelagem: existingAnimal.pelagem || '',
        data_nascimento: existingAnimal.data_nascimento || '',
        observacoes: existingAnimal.observacoes || '',
      })
    }
  }, [existingAnimal, reset])

  const mutation = useMutation({
    mutationFn: async (formData: AnimalFormData) => {
      const payload = { ...formData, property_id: propertyId }
      if (isEditing) {
        const { error } = await supabase.from('animais').update(payload).eq('id', id!)
        if (error) throw error
      } else {
        const { error } = await supabase.from('animais').insert(payload)
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

  const fieldClass = "w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all bg-white"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Brinco *</label>
            <input {...register('brinco')} className={fieldClass} placeholder="Ex: 001" />
            {errors.brinco && <p className="text-xs text-red-500 mt-1">{errors.brinco.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nome</label>
            <input {...register('nome')} className={fieldClass} placeholder="Ex: Mimosa" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Categoria</label>
            <select {...register('categoria')} className={fieldClass}>
              <option value="">Selecione</option>
              <option value="vaca">Vaca</option>
              <option value="touro">Touro</option>
              <option value="bezerro">Bezerro</option>
              <option value="bezerra">Bezerra</option>
              <option value="novilha">Novilha</option>
              <option value="garrote">Garrote</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sexo</label>
            <select {...register('sexo')} className={fieldClass}>
              <option value="">Selecione</option>
              <option value="M">Macho</option>
              <option value="F">Fêmea</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Raça</label>
            <input {...register('raca')} className={fieldClass} placeholder="Ex: Nelore" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pelagem</label>
            <input {...register('pelagem')} className={fieldClass} placeholder="Ex: Branca" />
          </div>
          <div>
            <label className={labelClass}>Data de Nascimento</label>
            <input type="date" {...register('data_nascimento')} className={fieldClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Observações</label>
          <textarea {...register('observacoes')} rows={3} className={fieldClass} placeholder="Alguma observação sobre o animal..." />
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

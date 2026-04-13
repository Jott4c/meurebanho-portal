import { X, Mail, User, Shield, Phone, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEmployees } from '../hooks/useEmployees'

const inviteSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Selecione um cargo')
})

type InviteForm = z.infer<typeof inviteSchema>

interface EmployeeInviteModalProps {
  open: boolean
  onClose: () => void
}

export default function EmployeeInviteModal({ open, onClose }: EmployeeInviteModalProps) {
  const { roles, inviteEmployee, isInviting } = useEmployees()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema)
  })

  const onSubmit = async (data: InviteForm) => {
    try {
      const selectedRole = roles.find(r => r.id === data.roleId)
      await inviteEmployee({
        name: data.name,
        email: data.email,
        phone: data.phone,
        roleId: data.roleId,
        roleName: selectedRole?.name
      })
      reset()
      onClose()
    } catch (err) {
      console.error('Erro ao convidar:', err)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-neutral-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 leading-none">Convidar para Equipe</h2>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-2">Expanda sua operação</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                <User size={18} />
              </div>
              <input 
                {...register('name')}
                placeholder="Ex: João Silva"
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  {...register('email')}
                  placeholder="joao@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">{errors.email.message}</p>}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Telefone (Opcional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input 
                  {...register('phone')}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Cargo / Função</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                <Shield size={18} />
              </div>
              <select 
                {...register('roleId')}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="">Selecione o cargo...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            {errors.roleId && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">{errors.roleId.message}</p>}
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isInviting}
              className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isInviting}
              className="flex-[2] py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-neutral-900/20 transition-all flex items-center justify-center gap-2"
            >
              {isInviting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  ENVIANDO...
                </>
              ) : (
                'ENVIAR CONVITE'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

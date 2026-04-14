import { 
  Users, UserPlus, Mail, Phone, 
  Trash2, Power, Activity, Shield,
  CheckCircle2, Clock, RotateCcw
} from 'lucide-react'
import { useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { useEmployees } from '../../hooks/useEmployees'
import EmployeeInviteModal from '../../components/EmployeeInviteModal'

export default function Equipe() {
  const { 
    data: employees, 
    isLoading, 
    deleteEmployee, 
    toggleStatus, 
    isDeleting,
    resendInvite
  } = useEmployees()
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string, name: string } | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const confirmDelete = (id: string, name: string) => {
    setEmployeeToDelete({ id, name })
    setDeleteModalOpen(true)
  }

  const handleDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false)
          setEmployeeToDelete(null)
        }
      })
    }
  }

  const handleResend = async (emp: any) => {
    try {
      await resendInvite(emp)
      alert(`Convite reenviado com sucesso para ${emp.email}`)
    } catch (err) {
      console.error('Falha ao reenviar:', err)
    }
  }

  if (isLoading) return <LoadingSpinner message="Carregando equipe..." />

  const totalEmployees = employees?.length || 0
  const activeEmployees = employees?.filter(e => e.active && e.invite_status === 'accepted').length || 0
  const pendingInvites = employees?.filter(e => e.invite_status === 'pending' || e.invite_status === 'sent').length || 0

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Equipe de Campo</h1>
          <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest">Controle total sobre vacinação, manejos e segurança</p>
        </div>

        <button
          className="group flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black px-8 py-5 rounded-[2rem] shadow-2xl shadow-neutral-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setInviteModalOpen(true)}
        >
          <div className="p-2 bg-white/10 rounded-xl group-hover:rotate-12 transition-transform">
            <UserPlus size={20} />
          </div>
          CONVIDAR FUNCIONÁRIO
        </button>
      </div>

      {/* Stats Summary Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-6 group hover:border-primary-200 transition-all">
          <div className="p-5 bg-primary-50 text-primary-600 rounded-3xl group-hover:bg-primary-600 group-hover:text-white transition-all">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">Total na Equipe</p>
            <p className="text-4xl font-black text-neutral-900 leading-none">{totalEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
          <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">Ativos no App</p>
            <p className="text-4xl font-black text-neutral-900 leading-none">{activeEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-6 group hover:border-amber-200 transition-all">
          <div className="p-5 bg-amber-50 text-amber-600 rounded-3xl group-hover:bg-amber-600 group-hover:text-white transition-all">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">Convites Pendentes</p>
            <p className="text-4xl font-black text-neutral-900 leading-none">{pendingInvites}</p>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {!employees || employees.length === 0 ? (
        <div className="bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-200 p-20 flex flex-col items-center text-center space-y-6">
          <div className="p-8 bg-white rounded-[2.5rem] shadow-xl text-neutral-300">
            <Users size={64} />
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Sua equipe está vazia</h3>
            <p className="text-neutral-500 font-medium">Cadastre veterinários e vaqueiros para começar a delegar tarefas e registrar manejos.</p>
          </div>
          <button 
             onClick={() => setInviteModalOpen(true)}
             className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all"
          >
            Convidar agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((emp) => {
            const initials = emp.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
            const isPending = emp.invite_status === 'pending' || emp.invite_status === 'sent'
            
            return (
              <div key={emp.id} className="group bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 hover:border-primary-100 transition-all overflow-hidden flex flex-col">
                {/* Card Top: Identity */}
                <div className="p-8 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg ${
                      emp.active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 leading-none">{emp.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-tighter rounded-full">
                          {emp.role || 'Colaborador'}
                        </span>
                        {!emp.active && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-tighter rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full shadow-sm ring-4 ring-white ${
                      emp.invite_status === 'accepted' && emp.active ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                    }`} />
                  </div>
                </div>

                {/* Card Middle: Stats & Status */}
                <div className="px-8 flex-1 space-y-6">
                  {isPending ? (
                    <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Clock size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Convite Enviado</span>
                      </div>
                      <p className="text-[11px] text-amber-600/80 font-bold leading-relaxed">
                        Aguardando o funcionário definir a senha através do link enviado ao e-mail {emp.email}.
                      </p>
                      <button 
                         onClick={() => handleResend(emp)}
                         className="w-full py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={12} />
                        Reenviar Link
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-neutral-50 rounded-[1.5rem] border border-neutral-100">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wider mb-1">Ações no Campo</p>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-primary-500" />
                          <p className="text-xl font-black text-neutral-900">{emp.action_count || 0}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-[1.5rem] border border-neutral-100">
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wider mb-1">Status App</p>
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-emerald-500" />
                          <p className="text-[11px] font-black text-neutral-900 uppercase">Conectado</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pb-6">
                    {emp.phone && (
                      <div className="flex items-center gap-3 text-neutral-500 hover:text-neutral-900 transition-colors cursor-default">
                        <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-white transition-all">
                          <Phone size={14} />
                        </div>
                        <span className="text-xs font-bold">{emp.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-neutral-500 hover:text-neutral-900 transition-colors cursor-default">
                      <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-white transition-all">
                        <Mail size={14} />
                      </div>
                      <span className="text-xs font-bold truncate max-w-[180px]">{emp.email || (emp.user_id ? 'Vinculado' : 'Sem e-mail')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Actions */}
                <div className="px-8 py-5 border-t border-neutral-50 bg-neutral-50/30 flex items-center justify-between">
                  <button 
                    onClick={() => toggleStatus({ id: emp.id, active: !emp.active })}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                      emp.active 
                      ? 'text-amber-600 hover:bg-white shadow-sm' 
                      : 'text-emerald-600 hover:bg-white shadow-sm border border-emerald-100'
                    }`}
                  >
                    <Power size={14} />
                    {emp.active ? 'Bloquear' : 'Desbloquear'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => confirmDelete(emp.id, emp.name)}
                      className="p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      title="Excluir Permanentemente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <EmployeeInviteModal 
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="Excluir Membro da Equipe"
        message={`Esta ação é permanente. Todos os logs de atividade de ${employeeToDelete?.name} serão mantidos, mas o acesso será revogado e o perfil deletado.`}
        confirmLabel={isDeleting ? 'EXCLUINDO...' : 'SIM, EXCLUIR REGISTRO'}
        variant="danger"
        onCancel={() => !isDeleting && setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

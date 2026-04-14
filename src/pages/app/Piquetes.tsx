import { MapPin, Plus, Trash2, Maximize2, Users, Loader2, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { usePaddocks } from '../../hooks/usePaddocks'
import { useAuth } from '../../contexts/AuthContext'

export default function Piquetes() {
  const { propertyId } = useAuth()
  const { data: paddocks, isLoading, createPaddock, deletePaddock, isCreating, isDeleting } = usePaddocks()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newArea, setNewArea] = useState('')
  const [newCapacity, setNewCapacity] = useState('')
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [paddockToDelete, setPaddockToDelete] = useState<{ id: string, name: string } | null>(null)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return

    createPaddock({
      property_id: propertyId!,
      name: newName,
      area: newArea ? parseFloat(newArea) : undefined,
      capacity: newCapacity ? parseInt(newCapacity) : undefined
    }, {
      onSuccess: () => {
        setNewName('')
        setNewArea('')
        setNewCapacity('')
        setIsAdding(false)
      }
    })
  }

  const handleDelete = () => {
    if (paddockToDelete) {
      deletePaddock(paddockToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false)
          setPaddockToDelete(null)
        }
      })
    }
  }

  if (isLoading) return <LoadingSpinner message="Carregando piquetes..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Piquetes</h1>
          <p className="text-sm text-neutral-500 mt-1">Gerencie as áreas de pastagem e localizações da sua fazenda.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus size={18} />
          Novo Piquete
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border-2 border-primary-100 shadow-md p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Adicionar Novo Piquete</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Nome do Piquete *</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Piquete da Baixada"
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Área (Hectares)</label>
              <input 
                type="number" 
                step="0.01"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Ex: 5.5"
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Capacidade (Cabeças)</label>
              <input 
                type="number" 
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="Ex: 20"
                className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                Salvar Piquete
              </button>
            </div>
          </form>
        </div>
      )}

      {!paddocks || paddocks.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Nenhum piquete cadastrado"
          description="Organize sua fazenda em áreas para melhor controle do rebanho e do pasto."
          action={
            <button 
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 font-medium px-4 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Criar meu primeiro piquete
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paddocks.map((paddock) => (
            <div key={paddock.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <MapPin size={24} />
                  </div>
                  <button 
                    onClick={() => {
                      if ((paddock.animal_count || 0) > 0) {
                        alert('Este piquete possui animais ativos e não pode ser excluído. Mova os animais para outro local primeiro.')
                        return
                      }
                      setPaddockToDelete({ id: paddock.id, name: paddock.name })
                      setDeleteModalOpen(true)
                    }}
                    title={(paddock.animal_count || 0) > 0 ? 'Piquete com animais' : 'Excluir Piquete'}
                    className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                      (paddock.animal_count || 0) > 0 
                      ? 'text-neutral-300 cursor-not-allowed' 
                      : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{paddock.name}</h3>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Maximize2 size={16} className="text-neutral-400" />
                    <span className="text-sm font-medium">{paddock.area ? `${paddock.area} ha` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Users size={16} className="text-neutral-400" />
                    <span className="text-sm font-medium">{paddock.capacity ? `${paddock.capacity} cab.` : 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Lotação */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Lotação</span>
                      <span className={`text-xs font-bold ${paddock.capacity && (paddock.animal_count || 0) >= paddock.capacity ? 'text-red-500' : 'text-neutral-700'}`}>
                        {paddock.animal_count || 0} / {paddock.capacity || '∞'}
                      </span>
                    </div>
                    {paddock.capacity ? (
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            ((paddock.animal_count || 0) / paddock.capacity) >= 1 ? 'bg-red-500' :
                            ((paddock.animal_count || 0) / paddock.capacity) >= 0.8 ? 'bg-amber-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min(((paddock.animal_count || 0) / paddock.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    ) : (
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-300 w-0" />
                      </div>
                    )}
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Última Entrada</span>
                      <div className="flex items-center gap-1.5 mt-1 text-neutral-600">
                        <Calendar size={14} className="text-primary-500" />
                        <span className="text-xs font-medium">
                          {paddock.last_entry_date ? new Date(paddock.last_entry_date).toLocaleDateString() : '---'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Vazio desde</span>
                      <div className="flex items-center gap-1.5 mt-1 text-neutral-600 justify-end">
                        <span className="text-xs font-medium">
                          {paddock.last_vacated_at ? new Date(paddock.last_vacated_at).toLocaleDateString() : '---'}
                        </span>
                        <Calendar size={14} className="text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Criado em {new Date(paddock.created_at).toLocaleDateString()}
                </span>
                <Link 
                  to={`/app/rebanho?paddockId=${paddock.id}`}
                  className="group/link flex items-center gap-2 transition-opacity"
                >
                  <span className="text-xs font-semibold text-primary-600 group-hover/link:translate-x-1 transition-transform">
                    Ver Animais →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Excluir Piquete"
        message={`Deseja realmente excluir o piquete "${paddockToDelete?.name}"? Isso não afetará os animais que estavam nele, mas o registro da área será perdido.`}
        confirmLabel={isDeleting ? 'Excluindo...' : 'Sim, excluir'}
        variant="danger"
        onCancel={() => !isDeleting && setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

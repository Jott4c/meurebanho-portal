import { useState } from 'react'
import { useAnimals, useDeleteAnimal } from '../../hooks/useAnimals'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'
import ConfirmModal from '../../components/ConfirmModal'
import { ANIMAL_CATEGORY_LABELS, ANIMAL_STATUS_LABELS } from '../../types'

export default function RebanhoList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [animalToDelete, setAnimalToDelete] = useState<{id: string, identificacao: string} | null>(null)

  const itemsPerPage = 10

  const { data, isLoading, error } = useAnimals({
    page,
    limit: itemsPerPage,
    search,
    status
  })

  const deleteMutation = useDeleteAnimal()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const confirmDelete = (id: string, brinco: string, nome?: string) => {
    setAnimalToDelete({ id, identificacao: nome ? `${brinco} - ${nome}` : brinco })
    setDeleteModalOpen(true)
  }

  const handleDelete = () => {
    if (animalToDelete) {
      deleteMutation.mutate(animalToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false)
          setAnimalToDelete(null)
          // Se for o último da página, voltar uma página
          if (data?.data.length === 1 && page > 1) {
            setPage(p => p - 1)
          }
        }
      })
    }
  }

  const totalPages = data ? Math.ceil(data.count / itemsPerPage) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Rebanho</h1>
          <p className="text-sm text-neutral-500 mt-1">Gerencie todos os animais da sua propriedade.</p>
        </div>
        <Link
          to="/app/rebanho/novo"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus size={18} />
          Novo Animal
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Barra de Filtros */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por brinco ou nome..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <select
              value={status}
              onChange={handleStatusChange}
              className="pl-10 pr-8 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none min-w-[150px] transition-all"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="vendido">Vendido</option>
              <option value="morto">Morto</option>
            </select>
          </div>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">Erro ao carregar animais.</div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50/50 text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Brinco</th>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Raça</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.data.map(animal => (
                    <tr key={animal.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-neutral-900">{animal.brinco}</td>
                      <td className="px-4 py-3">{animal.nome || '-'}</td>
                      <td className="px-4 py-3">{animal.categoria ? ANIMAL_CATEGORY_LABELS[animal.categoria] : '-'}</td>
                      <td className="px-4 py-3">{animal.raca || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          animal.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' :
                          animal.status === 'vendido' ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {ANIMAL_STATUS_LABELS[animal.status || 'ativo']}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/app/rebanho/${animal.id}`} className="p-1.5 text-neutral-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors" title="Detalhes">
                            <Eye size={16} />
                          </Link>
                          <Link to={`/app/rebanho/${animal.id}/editar`} className="p-1.5 text-neutral-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </Link>
                          <button 
                            onClick={() => confirmDelete(animal.id, animal.brinco, animal.nome)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" 
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/30 flex justify-between items-center">
              <span className="text-xs text-neutral-500">
                Mostrando {Math.min(data.count, (page - 1) * itemsPerPage + 1)} até {Math.min(data.count, page * itemsPerPage)} de {data.count}
              </span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <EmptyState 
            title="Nenhum animal encontrado"
            description={search || status ? "Tente limpar os filtros para ver todo o rebanho." : "Você ainda não cadastrou nenhum animal."}
            action={
              <Link to="/app/rebanho/novo" className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 font-medium px-4 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
                Cadastrar agora
              </Link>
            }
          />
        )}
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        title="Excluir animal"
        message={`Tem certeza que deseja excluir o animal ${animalToDelete?.identificacao}? Esta ação não pode ser desfeita.`}
        confirmLabel={deleteMutation.isPending ? 'Excluindo...' : 'Sim, excluir'}
        variant="danger"
        onCancel={() => !deleteMutation.isPending && setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

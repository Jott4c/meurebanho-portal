import { useState } from 'react'
import { useAnimals, useDeleteAnimal, useBatchDeleteAnimal, useBatchUpdateAnimal } from '../../hooks/useAnimals'
import { usePaddocks } from '../../hooks/usePaddocks'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Filter, Edit2, Trash2, Eye, FileUp, CheckSquare, Square, X, Check, ArrowRight, Download, RotateCcw, ChevronRight, CheckCircle2, MapPin } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'
import ConfirmModal from '../../components/ConfirmModal'
import { ANIMAL_CATEGORY_LABELS, ANIMAL_STATUS_LABELS } from '../../types'
import { supabase } from '../../lib/supabase'
import * as XLSX from 'xlsx'

interface ExportOptions {
  basics: boolean
  traits: boolean
  location: boolean
  performance: boolean // Peso e Leite
  age: boolean
  history: boolean
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: ExportOptions) => void
  count: number
}

function ExportConfirmModal({ isOpen, onClose, onConfirm, count }: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    basics: true,
    traits: true,
    location: true,
    performance: true,
    age: true,
    history: true,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 pb-2 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Download size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 leading-tight">Exportar Rebanho</h2>
              <p className="text-xs text-neutral-500 font-medium">Selecione as colunas para o Excel ({count} animais).</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-neutral-50/30">
          <div className="p-4 bg-white rounded-2xl border border-neutral-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-neutral-700">Identificação (Brinco)</span>
            </div>
            <Check size={18} className="text-emerald-500" strokeWidth={3} />
          </div>

          <button 
            onClick={() => setOptions(prev => ({ ...prev, basics: !prev.basics }))}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.basics ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10 shadow-sm' : 'bg-white border-neutral-200 opacity-60'}`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold block ${options.basics ? 'text-primary-900' : 'text-neutral-500'}`}>Dados Cadastrais</span>
              <span className="text-[10px] text-neutral-400 font-medium">Sexo, Categoria</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.basics ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
              {options.basics && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </button>

          <button 
            onClick={() => setOptions(prev => ({ ...prev, performance: !prev.performance }))}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.performance ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10 shadow-sm' : 'bg-white border-neutral-200 opacity-60'}`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold block ${options.performance ? 'text-primary-900' : 'text-neutral-500'}`}>Performance Geral</span>
              <span className="text-[10px] text-neutral-400 font-medium">Peso Atual e Média de Leite</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.performance ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
              {options.performance && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </button>

          <button 
            onClick={() => setOptions(prev => ({ ...prev, age: !prev.age }))}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.age ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10 shadow-sm' : 'bg-white border-neutral-200 opacity-60'}`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold block ${options.age ? 'text-primary-900' : 'text-neutral-500'}`}>Cronologia</span>
              <span className="text-[10px] text-neutral-400 font-medium">Idade calculada no Excel</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.age ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
              {options.age && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </button>

          <button 
            onClick={() => setOptions(prev => ({ ...prev, traits: !prev.traits }))}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.traits ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10 shadow-sm' : 'bg-white border-neutral-200 opacity-60'}`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold block ${options.traits ? 'text-primary-900' : 'text-neutral-500'}`}>Características</span>
              <span className="text-[10px] text-neutral-400 font-medium">Raça, Cor</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.traits ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
              {options.traits && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </button>

          <button 
            onClick={() => setOptions(prev => ({ ...prev, location: !prev.location }))}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.location ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10 shadow-sm' : 'bg-white border-neutral-200 opacity-60'}`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold block ${options.location ? 'text-primary-900' : 'text-neutral-500'}`}>Localização</span>
              <span className="text-[10px] text-neutral-400 font-medium">Piquete, Lote</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.location ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
              {options.location && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </button>

          <button 
            onClick={() => setOptions(prev => ({ ...prev, history: !prev.history }))}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.history ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10 shadow-sm' : 'bg-white border-neutral-200 opacity-60'}`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold block ${options.history ? 'text-primary-900' : 'text-neutral-500'}`}>Histórico</span>
              <span className="text-[10px] text-neutral-400 font-medium">Status, Data Cadastro</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.history ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
              {options.history && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </button>
        </div>

        <div className="p-6 border-t border-neutral-100 bg-white">
          <button 
            onClick={() => onConfirm(options)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-neutral-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Baixar Planilha Agora
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RebanhoList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [category, setCategory] = useState('')
  const [sex, setSex] = useState('')
  const [paddockId, setPaddockId] = useState(searchParams.get('paddockId') || '')
  const [breed, setBreed] = useState('')
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isManejoOpen, setIsManejoOpen] = useState(false)

  const { data, isLoading, error } = useAnimals({
    search,
    status,
    category,
    sex,
    paddockId,
    breed
  })

  const { data: paddocks } = usePaddocks()
  const batchUpdateMutation = useBatchUpdateAnimal()

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return '-'
    const birth = new Date(birthDate)
    const now = new Date()
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (months < 0) return 'Recém-nascido'
    if (months >= 24) {
      const years = Math.floor(months / 12)
      const remMonths = months % 12
      return `${years} ano(s)${remMonths > 0 ? ` e ${remMonths} mês(es)` : ''}`
    }
    return `${months} mês(es)`
  }

  const handleExportExcel = async (options: ExportOptions) => {
    setIsExportModalOpen(false)
    if (!data?.data || data.data.length === 0) return
    
    setIsExporting(true)

    try {
      const animalIds = data.data.map(a => a.id)
      let weightsMap: Record<string, number> = {}
      let milkMap: Record<string, number> = {}

      if (options.performance) {
        // Buscar pesos recentes
        const { data: latestWeights } = await supabase
          .from('animal_weights')
          .select('animal_id, weight')
          .in('animal_id', animalIds)
          .order('date', { ascending: false })
        
        if (latestWeights) {
          latestWeights.forEach(w => {
            if (!weightsMap[w.animal_id]) weightsMap[w.animal_id] = w.weight
          })
        }

        // Buscar produções recentes
        const { data: latestMilk } = await supabase
          .from('milk_productions')
          .select('animal_id, liters')
          .in('animal_id', animalIds)
          .order('date', { ascending: false })
        
        if (latestMilk) {
          latestMilk.forEach(m => {
            if (!milkMap[m.animal_id]) milkMap[m.animal_id] = m.liters
          })
        }
      }

      const exportData = data.data.map(a => {
        const row: any = {
          'Brinco': a.ear_tag,
        }

        if (options.basics) {
          row['Categoria'] = a.category ? ANIMAL_CATEGORY_LABELS[a.category] : ''
          row['Sexo'] = a.sex === 'M' ? 'Macho' : 'Fêmea'
        }

        if (options.age) {
          row['Idade'] = calculateAge(a.birth_date)
          row['Data de Nasc.'] = a.birth_date ? new Date(a.birth_date).toLocaleDateString('pt-BR') : '-'
        }

        if (options.performance) {
          row['Peso Atual (kg)'] = weightsMap[a.id] || '-'
          row['Média de Leite (L)'] = milkMap[a.id] || '-'
        }

        if (options.traits) {
          row['Raça'] = a.breed || '-'
          row['Cor'] = a.color || '-'
        }

        if (options.location) {
          row['Piquete'] = a.paddock_id 
            ? paddocks?.find(p => p.id === a.paddock_id)?.name || a.paddock || '-'
            : a.paddock || '-'
        }

        if (options.history) {
          row['Status'] = ANIMAL_STATUS_LABELS[a.status] || a.status
          row['Data de Cadastro'] = new Date(a.created_at).toLocaleDateString('pt-BR')
        }

        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rebanho")
      XLSX.writeFile(workbook, `rebanho_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error('Erro na exportação:', err)
      alert('Erro ao gerar planilha. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setSelectedIds(new Set())
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value)
    setSelectedIds(new Set())
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value)
    setSelectedIds(new Set())
  }

  const handleSexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSex(e.target.value)
    setSelectedIds(new Set())
  }

  const handlePaddockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaddockId(e.target.value)
    setSelectedIds(new Set())
  }

  const handleBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBreed(e.target.value)
    setSelectedIds(new Set())
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setCategory('')
    setSex('')
    setPaddockId('')
    setBreed('')
    setSelectedIds(new Set())
    setSearchParams({})
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === data?.data.length) {
      setSelectedIds(new Set())
    } else if (data?.data) {
      setSelectedIds(new Set(data.data.map(a => a.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const handleBatchManejo = (newPaddockId: string | null) => {
    batchUpdateMutation.mutate({
      ids: Array.from(selectedIds),
      updates: { paddock_id: newPaddockId || undefined }
    }, {
      onSuccess: () => {
        setSelectedIds(new Set())
        setIsManejoOpen(false)
      }
    })
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Rebanho</h1>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
            <span>Gerencie todos os animais da sua propriedade.</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-all shadow-sm flex-1 sm:flex-none"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Processando...' : 'Exportar Excel'}
          </button>
          <Link
            to="/app/rebanho/importar"
            className="flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <FileUp size={18} />
            Importar
          </Link>
          <Link
            to="/app/rebanho/novo"
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex-1 sm:flex-none"
          >
            <Plus size={18} />
            Novo Animal
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden relative">
        <div className="p-4 border-b border-neutral-100 flex flex-col gap-3 bg-neutral-50/30">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por brinco..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full pl-10 pr-8 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none min-w-[140px] transition-all shadow-sm"
                >
                  <option value="">Status</option>
                  <option value="active">Ativo</option>
                  <option value="sold">Vendido</option>
                  <option value="dead">Morto</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full pl-4 pr-8 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none min-w-[140px] transition-all shadow-sm"
                >
                  <option value="">Categoria</option>
                  {Object.entries(ANIMAL_CATEGORY_LABELS).filter(([key]) => !key.toUpperCase().includes('_') && key === key.toLowerCase()).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sex}
                  onChange={handleSexChange}
                  className="w-full pl-4 pr-8 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none min-w-[110px] transition-all shadow-sm"
                >
                  <option value="">Sexo</option>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={paddockId}
                  onChange={handlePaddockChange}
                  className="w-full pl-4 pr-8 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm appearance-none min-w-[140px] transition-all shadow-sm"
                >
                  <option value="">Piquete</option>
                  {paddocks?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Raça..."
                  value={breed}
                  onChange={handleBreedChange}
                  className="w-full pl-4 pr-4 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm min-w-[120px] transition-all shadow-sm"
                />
              </div>

              {(search || status || category || sex || paddockId || breed) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors"
                  title="Limpar filtros"
                >
                  <RotateCcw size={16} />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>
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
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-primary-600 transition-colors">
                        {data.data.length > 0 && selectedIds.size === data.data.length ? <CheckSquare size={18} className="text-primary-600" /> : <Square size={18} />}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Brinco</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Categoria</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Raça</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Piquete</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.data.map(animal => (
                    <tr 
                      key={animal.id} 
                      className={`transition-colors group ${selectedIds.has(animal.id) ? 'bg-primary-50/30' : 'hover:bg-neutral-50/50'}`}
                      onClick={() => toggleSelect(animal.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(animal.id)} className="text-neutral-300 hover:text-primary-500 transition-colors">
                          {selectedIds.has(animal.id) ? <CheckSquare size={18} className="text-primary-600" /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-bold text-neutral-900">{animal.ear_tag}</td>
                      <td className="px-4 py-3">{animal.category ? ANIMAL_CATEGORY_LABELS[animal.category] : '-'}</td>
                      <td className="px-4 py-3">{animal.breed || '-'}</td>
                      <td className="px-4 py-3">
                        {animal.paddock_id 
                          ? paddocks?.find(p => p.id === animal.paddock_id)?.name || animal.paddock || '-'
                          : animal.paddock || '-'
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          animal.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          animal.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {ANIMAL_STATUS_LABELS[animal.status || 'active']}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/app/rebanho/${animal.id}`} className="p-1.5 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-white border border-transparent hover:border-neutral-200 transition-all shadow-sm" title="Detalhes">
                            <Eye size={16} />
                          </Link>
                          <Link to={`/app/rebanho/${animal.id}/editar`} className="p-1.5 text-neutral-400 hover:text-amber-600 rounded-lg hover:bg-white border border-transparent hover:border-neutral-200 transition-all shadow-sm" title="Editar">
                            <Edit2 size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/30 flex justify-between items-center text-xs font-medium text-neutral-500">
              Mostrando todos os {data.count} animais
            </div>
          </>
        ) : (
            <EmptyState 
            title="Nenhum animal encontrado"
            description={search || status || category || sex || paddockId || breed ? "Tente limpar os filtros para ver todo o rebanho." : "Você ainda não cadastrou nenhum animal."}
            action={
              <Link to="/app/rebanho/novo" className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 font-bold px-4 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
                Cadastrar agora
              </Link>
            }
          />
        )}
      </div>

      {/* Barra de Ações em Lote */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 border-r border-neutral-700 pr-6">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-sm">
              {selectedIds.size}
            </div>
            <span className="text-sm font-bold truncate max-w-[120px]">Selecionados</span>
            <button onClick={() => setSelectedIds(new Set())} className="hover:text-neutral-400">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {!isManejoOpen ? (
              <button 
                onClick={() => setIsManejoOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/10"
              >
                <MapPin size={14} className="text-primary-400" /> Manejo
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <select
                  onChange={(e) => handleBatchManejo(e.target.value === 'null' ? null : e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Exportação */}
      <ExportConfirmModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportExcel}
        count={data?.data.length || 0}
      />

    </div>
  )
}

function Loader2({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

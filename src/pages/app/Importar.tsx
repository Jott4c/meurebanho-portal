import { useState, useRef } from 'react'
import { FileUp, Table, CheckCircle, AlertTriangle, Loader2, Download, HelpCircle, CheckCircle2, ChevronRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMassImport, type ImportRow, type ImportOptions } from '../../hooks/useMassImport'
import * as XLSX from 'xlsx'

type Step = 'file' | 'mapping' | 'importing' | 'result'

const EXPECTED_HEADERS = ['Brinco', 'Categoria', 'Sexo', 'Raca', 'Cor', 'Data Nascimento', 'Peso Atual', 'Media de Leite', 'Idade']

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: ImportOptions) => void
  count: number
  hasWeight: boolean
  hasMilk: boolean
  hasAge: boolean
}

function ConfirmImportModal({ isOpen, onClose, onConfirm, count, hasWeight, hasMilk, hasAge }: ConfirmModalProps) {
  const [options, setOptions] = useState<ImportOptions>({
    weights: true,
    milk: true,
    ageAsBirthdate: true,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 pb-2 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 leading-tight">Importação de Dados</h2>
              <p className="text-xs text-neutral-500 font-medium">Preparamos {count} animais da sua planilha.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-neutral-50/30">
          <p className="text-sm text-neutral-600 font-bold mb-4 px-1">Selecione o que deseja levar:</p>
          
          <div className="p-4 bg-white rounded-2xl border border-neutral-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-neutral-700">Dados Básicos (Obrigatório)</span>
            </div>
            <Check size={18} className="text-emerald-500" />
          </div>

          {hasWeight && (
            <button 
              onClick={() => setOptions(prev => ({ ...prev, weights: !prev.weights }))}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.weights ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10' : 'bg-white border-neutral-200 opacity-60'}`}
            >
              <span className={`text-sm font-bold ${options.weights ? 'text-primary-900' : 'text-neutral-500'}`}>Importar Histórico de Peso</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.weights ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
                {options.weights && <Check size={14} className="text-white" />}
              </div>
            </button>
          )}

          {hasMilk && (
            <button 
              onClick={() => setOptions(prev => ({ ...prev, milk: !prev.milk }))}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.milk ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10' : 'bg-white border-neutral-200 opacity-60'}`}
            >
              <span className={`text-sm font-bold ${options.milk ? 'text-primary-900' : 'text-neutral-500'}`}>Importar Média de Ordenha</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.milk ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
                {options.milk && <Check size={14} className="text-white" />}
              </div>
            </button>
          )}

          {hasAge && (
            <button 
              onClick={() => setOptions(prev => ({ ...prev, ageAsBirthdate: !prev.ageAsBirthdate }))}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${options.ageAsBirthdate ? 'bg-primary-50 border-primary-100 ring-2 ring-primary-500/10' : 'bg-white border-neutral-200 opacity-60'}`}
            >
              <div className="text-left">
                <span className={`text-sm font-bold block ${options.ageAsBirthdate ? 'text-primary-900' : 'text-neutral-500'}`}>Calcular Data de Nasc.</span>
                <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">Converte idade em data aproximada</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.ageAsBirthdate ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
                {options.ageAsBirthdate && <Check size={14} className="text-white" />}
              </div>
            </button>
          )}
        </div>

        <div className="p-6 border-t border-neutral-100 bg-white">
          <button 
            onClick={() => onConfirm(options)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-neutral-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Confirmar e Importar Agora
          </button>
        </div>
      </div>
    </div>
  )
}

function Check({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function Importar() {
  const { parseFile, importAnimals, progress } = useMassImport()
  
  const [step, setStep] = useState<Step>('file')
  const [rawData, setRawData] = useState<ImportRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  
  const [mapping, setMapping] = useState({
    ear_tag: '',
    category: '',
    sex: '',
    breed: '',
    color: '',
    birth_date: '',
    weight: '',
    milk_prod: '',
    age: ''
  })

  const [importResult, setImportResult] = useState<{success: boolean, count?: number, error?: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([EXPECTED_HEADERS])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Modelo_Importacao")
    XLSX.writeFile(wb, "rebanho_modelo.xlsx")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await processFile(selectedFile)
    }
  }

  const processFile = async (selectedFile: File) => {
    try {
      const data = await parseFile(selectedFile)
      if (data.length > 0) {
        setRawData(data)
        setHeaders(Object.keys(data[0]))
        
        // Auto-mapping básico expandido
        const newMapping = { ...mapping }
        const h = Object.keys(data[0]).map(header => ({ original: header, normalized: header.toLowerCase() }))
        
        h.forEach(({ original, normalized }) => {
          if (normalized.includes('brinco') || normalized.includes('ear') || normalized.includes('tag') || normalized.includes('identifica')) newMapping.ear_tag = original
          if (normalized.includes('categor') || normalized.includes('tipo')) newMapping.category = original
          if (normalized.includes('sexo') || normalized.includes('genero')) newMapping.sex = original
          if (normalized.includes('raca') || normalized.includes('breed')) newMapping.breed = original
          if (normalized.includes('cor') || normalized.includes('color')) newMapping.color = original
          if (normalized.includes('nascim') || normalized.includes('birth')) newMapping.birth_date = original
          if (normalized.includes('peso') || normalized.includes('weight') || normalized.includes('kg')) newMapping.weight = original
          if (normalized.includes('leite') || normalized.includes('milk') || normalized.includes('ordenha')) newMapping.milk_prod = original
          if (normalized.includes('idade') || normalized.includes('age')) newMapping.age = original
        })
        
        setMapping(newMapping)
        setStep('mapping')
      } else {
        alert('O arquivo parece estar vazio.')
      }
    } catch (err: any) {
      alert(`Erro ao ler arquivo: ${err.message}`)
    }
  }

  const handleOpenConfirm = () => {
    if (!mapping.ear_tag || !mapping.category || !mapping.sex) {
      alert('Por favor, mapeie pelo menos Brinco, Categoria e Sexo.')
      return
    }
    setIsConfirmModalOpen(true)
  }

  const handleStartImport = async (options: ImportOptions) => {
    setIsConfirmModalOpen(false)
    setStep('importing')
    try {
      const result = await importAnimals(rawData, mapping, options)
      setImportResult({ success: true, count: result.count })
      setStep('result')
    } catch (err: any) {
      setImportResult({ success: false, error: err.message })
      setStep('result')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) processFile(droppedFile)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Importação em Massa</h1>
          <p className="text-sm text-neutral-500 mt-1">Traga seu rebanho de planilhas CSV ou Excel em segundos.</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-sm bg-primary-50 px-4 py-2 rounded-xl transition-all"
        >
          <Download size={16} />
          Baixar Planilha Modelo
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className={`flex items-center gap-2 ${step === 'file' ? 'text-primary-600' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'file' ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}>1</div>
          <span className="text-sm font-semibold">Arquivo</span>
        </div>
        <div className="w-12 h-px bg-neutral-200" />
        <div className={`flex items-center gap-2 ${step === 'mapping' ? 'text-primary-600' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'mapping' ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}>2</div>
          <span className="text-sm font-semibold">Mapeamento</span>
        </div>
        <div className="w-12 h-px bg-neutral-200" />
        <div className={`flex items-center gap-2 ${step === 'importing' || step === 'result' ? 'text-primary-600' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 'importing' || step === 'result' ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}>3</div>
          <span className="text-sm font-semibold">Finalização</span>
        </div>
      </div>

      {step === 'file' && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-12 text-center hover:border-primary-400 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, .xlsx, .xls" />
          <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-50 group-hover:scale-110 transition-all">
            <FileUp size={40} className="text-neutral-400 group-hover:text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">Arraste seu arquivo aqui</h3>
          <p className="text-neutral-500 mt-2 max-w-sm mx-auto">Suporta formatos .CSV e .XLSX (Excel). Certifique-se de que a primeira linha contém os nomes das colunas.</p>
          <div className="mt-8">
            <span className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-primary-700 transition-colors inline-block text-sm uppercase tracking-widest">
              SELECIONAR ARQUIVO
            </span>
          </div>
        </div>
      )}

      {step === 'mapping' && (
        <div className="bg-white rounded-[2.5rem] border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="p-8 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                <Table size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-neutral-900">Mapear Colunas</h3>
                <p className="text-sm text-neutral-500 font-medium">Relacione as colunas da sua planilha com os campos do sistema.</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="text-xs font-black text-primary-700 bg-primary-100 px-4 py-2 rounded-full uppercase tracking-widest">{rawData.length} Animais</span>
            </div>
          </div>
          
          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Campos Obrigatórios */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Dados Obrigatórios</h4>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">
                    Brinco (Identificação) <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={mapping.ear_tag} 
                    onChange={e => setMapping({...mapping, ear_tag: e.target.value})}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                  >
                    <option value="">Selecione a coluna...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Categoria <span className="text-red-500">*</span></label>
                  <select 
                    value={mapping.category} 
                    onChange={e => setMapping({...mapping, category: e.target.value})}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                  >
                    <option value="">Selecione a coluna...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Sexo <span className="text-red-500">*</span></label>
                  <select 
                    value={mapping.sex} 
                    onChange={e => setMapping({...mapping, sex: e.target.value})}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                  >
                    <option value="">Selecione a coluna...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Campos Opcionais / Performance */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-neutral-300 rounded-full" />
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Informações de Performance</h4>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Peso Atual (kg)</label>
                  <select 
                    value={mapping.weight} 
                    onChange={e => setMapping({...mapping, weight: e.target.value})}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                  >
                    <option value="">(Ignorar)</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Média de Leite (L)</label>
                  <select 
                    value={mapping.milk_prod} 
                    onChange={e => setMapping({...mapping, milk_prod: e.target.value})}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                  >
                    <option value="">(Ignorar)</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Idade ou Nasc.</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={mapping.age} 
                      onChange={e => setMapping({...mapping, age: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                    >
                      <option value="">Idade...</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select 
                      value={mapping.birth_date} 
                      onChange={e => setMapping({...mapping, birth_date: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                    >
                      <option value="">Nasc...</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-6 md:col-span-2 pt-4 border-t border-neutral-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Raça</label>
                    <select 
                      value={mapping.breed} 
                      onChange={e => setMapping({...mapping, breed: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                    >
                      <option value="">(Opcional)</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1">Cor</label>
                    <select 
                      value={mapping.color} 
                      onChange={e => setMapping({...mapping, color: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-sm transition-all"
                    >
                      <option value="">(Opcional)</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
              <HelpCircle className="text-amber-600 shrink-0 mt-1" size={20} />
              <div className="text-xs text-amber-800 leading-relaxed font-bold">
                <p>O sistema processará o relacionamento automaticamente.</p>
                <p className="mt-1 font-medium opacity-80 underline">Saiba como preencher sua planilha para garantir 100% de sucesso na importação.</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
             <button
              onClick={() => setStep('file')}
              className="text-neutral-400 font-black px-6 py-3 rounded-2xl hover:bg-neutral-200 transition-colors text-xs uppercase tracking-widest"
            >
              Voltar
            </button>
            <button
              onClick={handleOpenConfirm}
              className="flex items-center gap-3 bg-neutral-900 text-white font-black py-4 px-10 rounded-[1.5rem] shadow-xl hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest group"
            >
              Iniciar Importação
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="bg-white rounded-[3rem] border border-neutral-200 shadow-sm p-16 text-center animate-in fade-in duration-500">
          <div className="relative w-40 h-40 mx-auto mb-10">
             <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-neutral-100"
                strokeWidth="2.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-primary-600 transition-all duration-700 ease-out"
                strokeDasharray={`${progress}, 100`}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-neutral-900">{progress}%</span>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Status</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-neutral-900">Sincronizando Dados...</h3>
          <p className="text-neutral-500 mt-2 font-medium max-w-sm mx-auto leading-relaxed">Estamos salvando {rawData.length} animais e seus históricos de performance. Por favor, não feche esta aba.</p>
          <div className="mt-8 flex justify-center">
             <div className="px-5 py-3 bg-neutral-50 rounded-2xl flex items-center gap-3 border border-neutral-100">
                <Loader2 size={18} className="animate-spin text-primary-600" />
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Gravando no Servidor</span>
             </div>
          </div>
        </div>
      )}

      {step === 'result' && importResult && (
        <div className="bg-white rounded-[3rem] border border-neutral-200 shadow-sm p-16 text-center animate-in zoom-in-95 duration-500">
          {importResult.success ? (
            <>
              <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-emerald-600 animate-bounce">
                <CheckCircle size={56} />
              </div>
              <h3 className="text-3xl font-black text-neutral-900 leading-tight">Importação Concluída!</h3>
              <p className="text-neutral-500 mt-3 text-lg font-medium">
                <span className="text-neutral-900 font-black">{importResult.count} animais</span> foram sincronizados com sucesso.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/app/rebanho"
                  className="bg-neutral-900 text-white px-10 py-5 rounded-3xl font-black hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/10 text-sm uppercase tracking-widest"
                >
                  Ver Rebanho Completo
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="text-neutral-500 bg-neutral-100 px-10 py-5 rounded-3xl font-black hover:bg-neutral-200 transition-all text-sm uppercase tracking-widest"
                >
                  Importar Outro
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-600">
                <AlertTriangle size={56} />
              </div>
              <h3 className="text-3xl font-black text-neutral-900">Erro no Processamento</h3>
              <p className="text-neutral-500 mt-3 font-medium">Não conseguimos concluir a importação total dos dados.</p>
              <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 text-sm font-bold text-left overflow-auto max-h-40">
                {importResult.error}
              </div>
              <button
                onClick={() => setStep('file')}
                className="mt-10 bg-neutral-900 text-white px-12 py-5 rounded-3xl font-black hover:bg-neutral-800 transition-all text-sm uppercase tracking-widest"
              >
                Tentar Novamente
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmImportModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleStartImport}
        count={rawData.length}
        hasWeight={!!mapping.weight}
        hasMilk={!!mapping.milk_prod}
        hasAge={!!mapping.age}
      />
    </div>
  )
}

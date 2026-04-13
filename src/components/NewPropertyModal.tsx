import { useState, useEffect } from 'react'
import { X, Home, MapPin, Maximize2, Loader2, Plus, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function NewPropertyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, refreshProperties, switchProperty } = useAuth()

  // Form states
  const [name, setName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [city, setCity] = useState('')
  const [totalArea, setTotalArea] = useState('')

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-new-property-modal', handleOpen)
    return () => window.removeEventListener('open-new-property-modal', handleOpen)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          name,
          state_code: stateCode.toUpperCase(),
          city,
          total_area_hectares: totalArea ? parseFloat(totalArea) : null,
        })
        .select()
        .single()

      if (error) throw error

      await refreshProperties()
      if (data?.id) switchProperty(data.id)
      
      setIsOpen(false)
      // Reset form
      setName('')
      setStateCode('')
      setCity('')
      setTotalArea('')
    } catch (err: any) {
      alert(`Erro ao criar propriedade: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => !isLoading && setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="px-8 pt-8 pb-6 flex justify-between items-start border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 text-primary-600 mb-2">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Expansão</span>
            </div>
            <h2 className="text-2xl font-black text-neutral-900 leading-tight">Nova Propriedade</h2>
            <p className="text-sm text-neutral-500 mt-1">Cadastre mais uma fazenda para gerir em seu portal.</p>
          </div>
          <button 
            disabled={isLoading}
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-2xl hover:bg-neutral-100 text-neutral-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Nome da Fazenda</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="Ex: Fazenda Santa Maria"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold placeholder:font-medium placeholder:text-neutral-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Estado (UF)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    required
                    type="text"
                    maxLength={2}
                    placeholder="Ex: SP"
                    value={stateCode}
                    onChange={e => setStateCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold placeholder:font-medium placeholder:text-neutral-300 uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Cidade</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Barretos"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold placeholder:font-medium placeholder:text-neutral-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Área Total (Hectares)</label>
              <div className="relative">
                <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.50"
                  value={totalArea}
                  onChange={e => setTotalArea(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none font-bold placeholder:font-medium placeholder:text-neutral-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  CRIANDO PROPRIEDADE...
                </>
              ) : (
                <>
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  CADASTRAR PROPRIEDADE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

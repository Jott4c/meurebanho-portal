import { Settings, Home, User, Save, Loader2, MapPin, Maximize2, Shield, Zap, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useProperty } from '../../hooks/useProperty'
import { useAuth } from '../../contexts/AuthContext'

export default function Configuracoes() {
  const { data: property, isLoading: loadingProperty, updateProperty, isUpdating } = useProperty()
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'property' | 'profile'>('property')

  const [farmName, setFarmName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [city, setCity] = useState('')
  const [totalArea, setTotalArea] = useState('')
  const [pastureArea, setPastureArea] = useState('')

  useEffect(() => {
    if (property) {
      setFarmName(property.name || '')
      setStateCode(property.state_code || '')
      setCity(property.city || '')
      setTotalArea(property.total_area_hectares?.toString() || '')
      setPastureArea(property.pasture_area_hectares?.toString() || '')
    }
  }, [property])

  const handleUpdateProperty = (e: React.FormEvent) => {
    e.preventDefault()
    updateProperty({
      name: farmName,
      state_code: stateCode,
      city,
      total_area_hectares: totalArea ? parseFloat(totalArea) : undefined,
      pasture_area_hectares: pastureArea ? parseFloat(pastureArea) : undefined
    }, {
      onSuccess: () => alert('Configurações da propriedade salvas com sucesso!')
    })
  }

  if (loadingProperty) return <LoadingSpinner message="Carregando configurações..." />

  const isUnlimited = profile?.plan?.toLowerCase() === 'unlimited'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Configurações</h1>
          <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
             <Settings size={16} className="text-primary-500" />
             Gestão administrativa da sua conta
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-100 p-1.5 rounded-[2rem] border border-neutral-200 shadow-inner w-fit">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black transition-all uppercase tracking-widest ${
            activeTab === 'property' ? 'bg-white text-neutral-900 shadow-xl' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Home size={16} strokeWidth={3} />
          Dados da Fazenda
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black transition-all uppercase tracking-widest ${
            activeTab === 'profile' ? 'bg-white text-neutral-900 shadow-xl' : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <User size={16} strokeWidth={3} />
          Meu Perfil
        </button>
      </div>

      {activeTab === 'property' ? (
        <form onSubmit={handleUpdateProperty} className="bg-white rounded-[3rem] border border-neutral-100 shadow-2xl shadow-neutral-200/50 overflow-hidden">
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Nome da Propriedade</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-neutral-800 transition-all"
                  placeholder="Ex: Fazenda Santa Maria"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                  className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-neutral-800 transition-all"
                  placeholder="MS"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-neutral-800 transition-all"
                  placeholder="Campo Grande"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                  <Maximize2 size={12} strokeWidth={3} /> Área Total (Hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-neutral-800 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                  <MapPin size={12} strokeWidth={3} /> Área de Pasto (Hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pastureArea}
                  onChange={(e) => setPastureArea(e.target.value)}
                  className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-neutral-800 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="px-10 py-6 bg-neutral-50 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="group flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-neutral-900/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-125 transition-transform" />}
              SALVAR CONFIGURAÇÕES
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Plan & Identity Card */}
          <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-neutral-900/40 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
             
             <div className="flex items-center gap-8 relative z-10">
                <div className="w-24 h-24 rounded-[2rem] bg-white text-neutral-900 flex items-center justify-center text-4xl font-black shadow-xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">{user?.email}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Status da Conta:</span>
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      isUnlimited ? 'bg-primary-500 text-neutral-900 shadow-lg shadow-primary-500/20' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {isUnlimited ? <Zap size={12} strokeWidth={4} /> : <Shield size={12} strokeWidth={4} />}
                      {profile?.plan || 'Free'}
                    </div>
                  </div>
                </div>
             </div>

             <div className="relative z-10 flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Desde</p>
                  <p className="font-black text-lg">{new Date(user?.created_at || '').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="w-px h-12 bg-neutral-800" />
                <div className="text-right">
                   <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Propriedades</p>
                   <p className="font-black text-lg">Múltiplas</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">E-mail de Acesso</label>
              <div className="p-5 bg-neutral-50 rounded-2xl border-2 border-transparent text-neutral-500 font-bold text-sm flex items-center justify-between">
                {user?.email}
                <Shield size={16} className="text-neutral-300" />
              </div>
              <p className="text-[10px] text-neutral-400 font-medium px-2 leading-relaxed italic">
                 Seu e-mail está verificado e é usado para autenticação em todos os seus dispositivos.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-4">
               <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Portal & App Sync</label>
               <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 font-bold text-sm flex items-center gap-3">
                 <CheckCircle2 size={18} />
                 Sincronização Ativa
               </div>
               <p className="text-[10px] text-emerald-600 font-medium px-2 leading-relaxed">
                 Todos os seus dados de campo estão sendo replicados em tempo real para o armazenamento em nuvem.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ChevronDown, Home, Plus, Check, Loader2 } from 'lucide-react'

export default function PropertySwitcher() {
  const { propertyId, properties, switchProperty } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentProperty = properties.find(p => p.id === propertyId)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (properties.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all shadow-sm max-w-[200px] sm:max-w-xs"
      >
        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
          <Home size={16} />
        </div>
        <div className="text-left hidden sm:block truncate">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Propriedade</p>
          <p className="text-sm font-bold text-neutral-900 truncate">{currentProperty?.name || 'Selecionar...'}</p>
        </div>
        <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-neutral-200 shadow-xl z-[60] py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          <div className="px-4 py-2 border-b border-neutral-100 mb-2">
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Suas Propriedades</h4>
          </div>
          
          <div className="max-h-64 overflow-y-auto px-2 space-y-1">
            {properties.map(prop => (
              <button
                key={prop.id}
                onClick={() => {
                  switchProperty(prop.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  prop.id === propertyId 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${prop.id === propertyId ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Home size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold truncate max-w-[160px]">{prop.name}</p>
                    <p className="text-[10px] opacity-70">{prop.city}, {prop.state_code}</p>
                  </div>
                </div>
                {prop.id === propertyId && <Check size={16} className="text-primary-600" />}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-100 px-2">
            <button
               onClick={() => {
                 // Disparar evento para abrir modal de nova propriedade
                 window.dispatchEvent(new CustomEvent('open-new-property-modal'))
                 setIsOpen(false)
               }}
               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-600 font-bold text-sm hover:bg-primary-50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Plus size={18} />
              </div>
              Nova Propriedade
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

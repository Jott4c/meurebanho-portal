import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Property } from '../types'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  propertyId: string | null
  properties: Property[]
  planBillingCycle: 'month' | 'year'
  planExpirationDate: string | null
  switchProperty: (id: string) => void
  refreshProperties: () => Promise<void>
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyId, setPropertyId] = useState<string | null>(localStorage.getItem('mrb_last_property'))
  const [planBillingCycle, setPlanBillingCycle] = useState<'month' | 'year'>('month')
  const [planExpirationDate, setPlanExpirationDate] = useState<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadProfile(session.user.id)
        loadProperties(session.user.id)
      } else {
        setProfile(null)
        setProperties([])
        setPropertyId(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Erro ao carregar perfil:', error.message)
        return
      }

      // Safety net: verificar se a assinatura venceu + carregar billing_cycle
      if (data.plan && data.plan !== 'free') {
        try {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status, current_period_end, billing_cycle')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (sub) {
            const isExpired = sub.current_period_end && new Date(sub.current_period_end) < new Date()
            const isCanceled = sub.status === 'canceled' || sub.status === 'failed'

            if (isExpired || isCanceled) {
              console.warn('[AuthContext] Assinatura vencida ou cancelada, revertendo para free')
              await supabase
                .from('users')
                .update({ plan: 'free', updated_at: new Date().toISOString() })
                .eq('id', userId)
              data.plan = 'free'
              setPlanBillingCycle('month')
              setPlanExpirationDate(null)
            } else {
              // Atualizar ciclo de cobrança da assinatura ativa
              setPlanBillingCycle((sub.billing_cycle as 'month' | 'year') || 'month')
              setPlanExpirationDate(sub.current_period_end)
            }
          }
        } catch (subErr) {
          console.warn('Erro ao verificar assinatura:', subErr)
        }
      } else {
        setPlanBillingCycle('month')
        setPlanExpirationDate(null)
      }

      setProfile(data)
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }

  async function loadProperties(userId: string) {
    try {
      // Buscar propriedades onde é dono
      const { data: owned } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId)

      // Buscar propriedades onde é funcionário
      const { data: employed } = await supabase
        .from('employees')
        .select('property_id, properties(*)')
        .eq('user_id', userId)

      const employedProps = (employed || [])
        .map(e => e.properties)
        .filter(Boolean) as unknown as Property[]

      const allProps = [...(owned || []), ...employedProps]
      
      // Remover duplicatas por ID
      const uniqueProps = Array.from(new Map(allProps.map(p => [p.id, p])).values())
      setProperties(uniqueProps)

      // Se não tiver propriedade selecionada ou a selecionada não estiver na lista, seleciona a primeira
      const currentExists = uniqueProps.some(p => p.id === propertyId)
      if (uniqueProps.length > 0 && (!propertyId || !currentExists)) {
        const firstId = uniqueProps[0].id
        setPropertyId(firstId)
        localStorage.setItem('mrb_last_property', firstId)
      }
    } catch (err) {
      console.error('Erro ao carrergar propriedades:', err)
    }
  }

  const switchProperty = (id: string) => {
    setPropertyId(id)
    localStorage.setItem('mrb_last_property', id)
  }

  const refreshProperties = async () => {
    if (user) await loadProperties(user.id)
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setPropertyId(null)
    setProperties([])
    setProfile(null)
    localStorage.removeItem('mrb_last_property')
  }

  return (
    <AuthContext.Provider value={{ 
      user,
      profile,
      session, 
      loading, 
      propertyId, 
      properties,
      planBillingCycle,
      planExpirationDate,
      switchProperty,
      refreshProperties,
      refreshProfile,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

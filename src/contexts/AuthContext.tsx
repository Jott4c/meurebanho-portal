import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  propertyId: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [propertyId, setPropertyId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        fetchPropertyId(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchPropertyId(session.user.id)
      } else {
        setPropertyId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchPropertyId(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('property_id')
      .eq('id', userId)
      .single()

    if (data?.property_id) {
      setPropertyId(data.property_id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setPropertyId(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, propertyId, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { UserProfile } from '@/core/types/auth'

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  signInDevAdmin: () => void
}

const DEV_MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Administrador Técnico Operix' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'admin@operix.local',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
}

const DEV_MOCK_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@operix.local',
  fullName: 'Administrador Técnico Operix',
  platformRole: 'platform_admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Profile fetch warning (may not exist yet):', error.message)
        setProfile(null)
      } else if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          avatarUrl: data.avatar_url ?? undefined,
          platformRole: data.platform_role,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // 0. Check Dev Auth Override (Solo en entorno local de desarrollo)
    if (import.meta.env.DEV && localStorage.getItem('operix_dev_auth') === 'true') {
      setUser(DEV_MOCK_USER)
      setProfile(DEV_MOCK_PROFILE)
      setIsLoading(false)
      return
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (localStorage.getItem('operix_dev_auth') === 'true') {
          return
        }
        setSession(newSession)
        setUser(newSession?.user ?? null)
        if (newSession?.user) {
          await fetchProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInDevAdmin = () => {
    if (!import.meta.env.DEV) return
    localStorage.setItem('operix_dev_auth', 'true')
    setUser(DEV_MOCK_USER)
    setProfile(DEV_MOCK_PROFILE)
    setIsLoading(false)
  }

  const signOut = async () => {
    localStorage.removeItem('operix_dev_auth')
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      isLoading,
      signOut,
      refreshProfile,
      signInDevAdmin,
    }),
    [user, session, profile, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

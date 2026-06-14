import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Cargar perfil desde la tabla profiles
  const loadProfile = useCallback(async (userId: string, email: string, userMetadata?: { full_name?: string; role?: string }) => {
    if (!supabase) return null

    console.log('[useAuth] Cargando perfil para:', { userId, email })

    const buildProfileFromData = (data: any) => ({
      id: userId,
      email,
      full_name: data.full_name ?? '',
      avatar_url: data.avatar_url,
      role: data.role ?? null,
      specialty: data.specialty,
      region: data.region,
      teaching_level: data.teaching_level,
      years_experience: data.years_experience ?? 0,
      is_onboarded: data.is_onboarded ?? false,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as UserProfile)

    try {
      // Intento 1: Usar RPC get_my_profile (SECURITY DEFINER - bypass RLS)
      // Esta función fue creada en la migración 002 para evitar la recursión RLS
      try {
        const { data: rpcProfile, error: rpcError } = await supabase
          .rpc('get_my_profile')

        if (rpcProfile && !rpcError) {
          console.log('[useAuth] Perfil obtenido via RPC con role:', rpcProfile.role)
          return buildProfileFromData(rpcProfile)
        }
        if (rpcError) {
          console.log('[useAuth] RPC falló:', rpcError.message)
        }
      } catch {
        console.log('[useAuth] RPC get_my_profile no disponible')
      }

      // Intento 2: SELECT directo (puede fallar si hay recursión RLS)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('[useAuth] SELECT profiles:', { profile, error })

      if (profile) {
        console.log('[useAuth] Perfil encontrado con role:', profile.role)
        return buildProfileFromData(profile)
      }

      // Intento 3: Upsert para crear el perfil si no existe
      if (error) {
        console.log('[useAuth] Error en SELECT, intentando upsert:', error.message)
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: userMetadata?.full_name ?? email.split('@')[0] ?? '',
            role: userMetadata?.role ?? 'user',
            is_onboarded: false,
          }, { onConflict: 'id' })

        if (upsertError) {
          console.log('[useAuth] Upsert falló:', upsertError.message)
        } else {
          console.log('[useAuth] Upsert exitoso')
        }
      }
    } catch (err) {
      console.log('[useAuth] Error al cargar perfil:', err)
    }

    // Fallback final: crear perfil básico desde auth metadata
    console.log('[useAuth] Usando fallback con metadata:', userMetadata)
    return {
      id: userId,
      email,
      full_name: userMetadata?.full_name ?? email.split('@')[0] ?? '',
      role: userMetadata?.role ?? null,
      created_at: new Date().toISOString(),
    } as UserProfile
  }, [])





  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      try {
        if (!supabase) {
          setState({ user: null, isLoading: false, isAuthenticated: false })
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const profile = await loadProfile(
            session.user.id,
            session.user.email ?? '',
            {
              full_name: session.user.user_metadata?.full_name,
              role: session.user.user_metadata?.role,
            }
          )
          setState({
            user: profile ?? {
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: session.user.user_metadata?.full_name ?? '',
              created_at: session.user.created_at ?? new Date().toISOString(),
            },
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({ user: null, isLoading: false, isAuthenticated: false })
        }
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false })
      }
    }

    checkSession()

    // Escuchar cambios de autenticación
    let subscription: { unsubscribe: () => void } | null = null

    try {
      if (supabase) {
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const profile = await loadProfile(
              session.user.id,
              session.user.email ?? '',
              {
                full_name: session.user.user_metadata?.full_name,
                role: session.user.user_metadata?.role,
              }
            )
            setState({
              user: profile ?? {
                id: session.user.id,
                email: session.user.email ?? '',
                full_name: session.user.user_metadata?.full_name ?? '',
                created_at: session.user.created_at ?? new Date().toISOString(),
              },
              isLoading: false,
              isAuthenticated: true,
            })
          } else {
            setState({ user: null, isLoading: false, isAuthenticated: false })
          }
        })
        subscription = data.subscription
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false })
      }
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [loadProfile])

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setState({ user: null, isLoading: false, isAuthenticated: false })
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    })
    if (error) throw error
  }, [])

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
  }
}

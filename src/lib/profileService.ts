import { supabase } from './supabase'
import type { UserProfile } from '@/types'

// ============================================================
// Servicio de perfiles de usuario
// CRUD para la tabla 'profiles' de Supabase
// ============================================================

/**
 * Obtiene el perfil completo de un usuario por su ID
 */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Actualiza el perfil de un usuario
 */
export async function updateProfile(
  userId: string,
  profile: Partial<{
    full_name: string
    avatar_url: string
    specialty: string
    region: string
    teaching_level: string
    years_experience: number
    is_onboarded: boolean
    role: string
  }>
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error('No se pudo actualizar el perfil')
  }
}

/**
 * Crea un perfil básico para un usuario nuevo
 */
export async function createProfile(profile: {
  id: string
  full_name: string
  avatar_url?: string
  role?: string
}): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url ?? null,
      role: profile.role ?? 'user',
      is_onboarded: false,
    })

  if (error) {
    // Si el error es por duplicado (ya existe el perfil), ignoramos
    if (error.code === '23505') return
    console.error('Error creating profile:', error)
    throw new Error('No se pudo crear el perfil')
  }
}

/**
 * Obtiene todos los usuarios (solo para admin)
 */
export async function fetchAllProfiles(): Promise<UserProfile[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all profiles:', error)
    throw new Error('No se pudieron cargar los usuarios')
  }

  return data ?? []
}

/**
 * Actualiza el rol de un usuario (solo para admin)
 */
export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user'
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('No se pudo actualizar el rol del usuario')
  }
}

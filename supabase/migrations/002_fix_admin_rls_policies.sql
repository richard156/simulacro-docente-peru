-- ============================================================
-- Migración: Corregir políticas RLS de administradores
-- 
-- El problema: La política "Admins can read all profiles" usaba
-- una subconsulta a public.profiles que disparaba nuevamente
-- las políticas RLS, causando recursión infinita.
--
-- Solución: Crear una función SECURITY DEFINER que bypasses
-- las políticas RLS para verificar el rol del usuario.
-- ============================================================

-- 1. Crear función auxiliar para verificar rol admin sin recursión RLS
-- SECURITY DEFINER ejecuta la función con los permisos del creador,
-- evitando así la recursión de políticas RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 2. Eliminar todas las políticas existentes de admin para recrearlas
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- 3. Crear nuevas políticas usando la función SECURITY DEFINER
-- Esto evita la recursión porque la función se ejecuta con permisos
-- del creador (postgres) y no dispara las políticas RLS.

CREATE POLICY "Admins can read all profiles"
    ON public.profiles
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Política para que admins puedan insertar perfiles
CREATE POLICY "Admins can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (public.is_admin());

-- 5. Política para que admins puedan eliminar perfiles
CREATE POLICY "Admins can delete profiles"
    ON public.profiles
    FOR DELETE
    USING (public.is_admin());

-- ============================================================
-- 6. Función RPC para que el frontend pueda leer su propio perfil
--    sin pasar por las políticas RLS (SECURITY DEFINER)
--    Esto es necesario porque las políticas RLS de admin causan
--    recursión al leer la misma tabla.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    profile_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url,
        'role', p.role,
        'specialty', p.specialty,
        'region', p.region,
        'teaching_level', p.teaching_level,
        'years_experience', p.years_experience,
        'is_onboarded', p.is_onboarded,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO profile_data
    FROM public.profiles p
    WHERE p.id = auth.uid();
    
    RETURN profile_data;
END;
$$;



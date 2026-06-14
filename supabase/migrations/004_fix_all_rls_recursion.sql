-- ============================================================
-- Migración: Eliminar TODAS las políticas RLS con recursión
--
-- Basado en el diagnóstico real de pg_policies:
-- Las políticas "Admins can manage X" usan subconsultas a
-- profiles que causan recursión infinita.
-- ============================================================

-- ============================================================
-- 1. TABLA: profiles - Eliminar políticas problemáticas
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Nota: "Admins can read all profiles", "Admins can update all profiles",
-- "Admins can delete profiles" ya fueron corregidas en la migración 002
-- y usan is_admin() correctamente.

-- ============================================================
-- 2. TABLA: exams - Eliminar políticas problemáticas
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can create exams" ON public.exams;
DROP POLICY IF EXISTS "Anyone can view published exams" ON public.exams;
DROP POLICY IF EXISTS "Anyone view published exams" ON public.exams;

-- Nota: "Admins can read all exams", "Admins can update exams",
-- "Admins can delete exams" ya fueron corregidas en la 003 y usan is_admin().

-- ============================================================
-- 3. TABLA: exam_cases - Eliminar políticas problemáticas
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage cases" ON public.exam_cases;
DROP POLICY IF EXISTS "Admins can create cases" ON public.exam_cases;
DROP POLICY IF EXISTS "Anyone can view cases from published exams" ON public.exam_cases;
DROP POLICY IF EXISTS "Anyone view cases of published exams" ON public.exam_cases;

-- ============================================================
-- 4. TABLA: case_questions - Eliminar políticas problemáticas
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage questions" ON public.case_questions;
DROP POLICY IF EXISTS "Admins can create questions" ON public.case_questions;
DROP POLICY IF EXISTS "Anyone can view questions from published exams" ON public.case_questions;
DROP POLICY IF EXISTS "Anyone view questions of published exams" ON public.case_questions;

-- ============================================================
-- 5. Recrear políticas faltantes
-- ============================================================

-- exams: política para INSERT (la 003 creó "Admins can create exams" pero se eliminó arriba)
CREATE POLICY "Admins can create exams"
    ON public.exams
    FOR INSERT
    WITH CHECK (public.is_admin());

-- exam_cases: política para INSERT
CREATE POLICY "Admins can create cases"
    ON public.exam_cases
    FOR INSERT
    WITH CHECK (public.is_admin());

-- case_questions: política para INSERT
CREATE POLICY "Admins can create questions"
    ON public.case_questions
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Políticas para usuarios: ver contenido publicado
CREATE POLICY "Anyone can view published exams"
    ON public.exams
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "Anyone can view cases from published exams"
    ON public.exam_cases
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.exams
            WHERE exams.id = exam_cases.exam_id
            AND exams.is_published = true
        )
    );

CREATE POLICY "Anyone can view questions from published exams"
    ON public.case_questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.exam_cases
            JOIN public.exams ON exams.id = exam_cases.exam_id
            WHERE exam_cases.id = case_questions.case_id
            AND exams.is_published = true
        )
    );

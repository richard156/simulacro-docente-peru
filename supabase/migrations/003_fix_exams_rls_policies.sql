-- ============================================================
-- Migración: Corregir políticas RLS en tablas de exámenes
--
-- Las tablas exams, exam_cases y case_questions tienen políticas
-- RLS que verifican role = 'admin' con subconsultas a profiles,
-- causando recursión infinita.
--
-- Solución: Usar la función public.is_admin() (SECURITY DEFINER)
-- creada en la migración 002.
-- ============================================================

-- ============================================================
-- 1. TABLA: exams
-- ============================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can read all exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can create exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can update exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can delete exams" ON public.exams;
DROP POLICY IF EXISTS "Users can read published exams" ON public.exams;

-- Crear políticas para admins (usando is_admin() para evitar recursión)
CREATE POLICY "Admins can read all exams"
    ON public.exams
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can create exams"
    ON public.exams
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exams"
    ON public.exams
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete exams"
    ON public.exams
    FOR DELETE
    USING (public.is_admin());

-- Política para usuarios: solo ver exámenes publicados
CREATE POLICY "Users can read published exams"
    ON public.exams
    FOR SELECT
    USING (is_published = true);

-- ============================================================
-- 2. TABLA: exam_cases
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all cases" ON public.exam_cases;
DROP POLICY IF EXISTS "Admins can create cases" ON public.exam_cases;
DROP POLICY IF EXISTS "Admins can update cases" ON public.exam_cases;
DROP POLICY IF EXISTS "Admins can delete cases" ON public.exam_cases;
DROP POLICY IF EXISTS "Users can read published cases" ON public.exam_cases;

CREATE POLICY "Admins can read all cases"
    ON public.exam_cases
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can create cases"
    ON public.exam_cases
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update cases"
    ON public.exam_cases
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete cases"
    ON public.exam_cases
    FOR DELETE
    USING (public.is_admin());

CREATE POLICY "Users can read published cases"
    ON public.exam_cases
    FOR SELECT
    USING (is_published = true);

-- ============================================================
-- 3. TABLA: case_questions
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all questions" ON public.case_questions;
DROP POLICY IF EXISTS "Admins can create questions" ON public.case_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.case_questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.case_questions;
DROP POLICY IF EXISTS "Users can read published questions" ON public.case_questions;

CREATE POLICY "Admins can read all questions"
    ON public.case_questions
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can create questions"
    ON public.case_questions
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update questions"
    ON public.case_questions
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete questions"
    ON public.case_questions
    FOR DELETE
    USING (public.is_admin());

CREATE POLICY "Users can read published questions"
    ON public.case_questions
    FOR SELECT
    USING (is_published = true);

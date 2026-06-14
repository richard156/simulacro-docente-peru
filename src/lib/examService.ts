import { supabase } from './supabase'
import type { Exam, ExamCase, CaseQuestion } from '@/types'

// ============================================================
// Servicio de datos para exámenes
// Conecta con las tablas de Supabase
// ============================================================

/**
 * Obtiene todos los exámenes publicados
 */
export async function fetchPublishedExams(): Promise<Exam[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('is_published', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exams:', error)
    throw new Error('No se pudieron cargar los exámenes')
  }

  return data ?? []
}

/**
 * Obtiene un examen por su ID
 */
export async function fetchExamById(examId: string): Promise<Exam | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (error) {
    console.error('Error fetching exam:', error)
    return null
  }

  return data
}

/**
 * Obtiene todos los casos de un examen
 */
export async function fetchExamCases(examId: string): Promise<ExamCase[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('exam_cases')
    .select('*')
    .eq('exam_id', examId)
    .eq('is_published', true)
    .order('case_number', { ascending: true })

  if (error) {
    console.error('Error fetching cases:', error)
    throw new Error('No se pudieron cargar los casos')
  }

  return data ?? []
}

/**
 * Obtiene todas las preguntas de un caso específico
 */
export async function fetchCaseQuestions(caseId: string): Promise<CaseQuestion[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('case_questions')
    .select('*')
    .eq('case_id', caseId)
    .eq('is_published', true)
    .order('question_number', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    throw new Error('No se pudieron cargar las preguntas')
  }

  return data ?? []
}

/**
 * Obtiene todas las preguntas de múltiples casos
 */
export async function fetchAllCaseQuestions(caseIds: string[]): Promise<Record<string, CaseQuestion[]>> {
  const result: Record<string, CaseQuestion[]> = {}

  // Cargar preguntas en paralelo
  const promises = caseIds.map(async (caseId) => {
    const questions = await fetchCaseQuestions(caseId)
    result[caseId] = questions
  })

  await Promise.all(promises)
  return result
}

/**
 * Carga un examen completo con casos y preguntas
 */
export async function loadFullExam(examId: string): Promise<{
  exam: Exam
  cases: ExamCase[]
  questions: Record<string, CaseQuestion[]>
} | null> {
  const exam = await fetchExamById(examId)
  if (!exam) return null

  const cases = await fetchExamCases(examId)
  const caseIds = cases.map(c => c.id)
  const questions = await fetchAllCaseQuestions(caseIds)

  return { exam, cases, questions }
}

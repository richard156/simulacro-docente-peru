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

  // Obtener todos los exámenes y filtrar en memoria
  // para evitar problemas con la sintaxis de .or() en Supabase
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exams:', error)
    throw new Error('No se pudieron cargar los exámenes')
  }

  // Filtrar: publicados (is_published = true o null) y activos (is_active = true o null)
  return (data ?? []).filter(
    (exam) =>
      (exam.is_published === true || exam.is_published === null) &&
      (exam.is_active === true || exam.is_active === null)
  )
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
    .order('case_number', { ascending: true })

  if (error) {
    console.error('Error fetching cases:', error)
    throw new Error('No se pudieron cargar los casos')
  }

  // Filtrar: publicados (is_published = true o null)
  return (data ?? []).filter(
    (c) => c.is_published === true || c.is_published === null
  )
}

/**
 * Normaliza las opciones de una pregunta: pueden venir como string[] o como QuestionOption[]
 * desde la BD. Las convierte siempre a QuestionOption[].
 */
function normalizeOptions(rawOptions: unknown): { id: string; label: string; text: string }[] {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  // Intentar parsear si es un string JSON
  let parsed = rawOptions
  if (typeof rawOptions === 'string') {
    try {
      parsed = JSON.parse(rawOptions)
    } catch {
      console.warn('⚠️ normalizeOptions: no se pudo parsear string JSON:', rawOptions)
    }
  }

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      // Caso: string[] - solo textos
      return (parsed as string[]).map((text, idx) => ({
        id: labels[idx]?.toLowerCase() || String.fromCharCode(97 + idx),
        label: labels[idx] || String.fromCharCode(65 + idx),
        text: text || '',
      }))
    } else {
      // Caso: QuestionOption[] - objetos completos
      return (parsed as { id?: string; label?: string; text?: string }[]).map((opt, idx) => ({
        id: opt.id || labels[idx]?.toLowerCase() || String.fromCharCode(97 + idx),
        label: opt.label || labels[idx] || String.fromCharCode(65 + idx),
        text: opt.text || '',
      }))
    }
  }

  console.warn('⚠️ normalizeOptions: formato no reconocido, usando fallback:', rawOptions)
  // Fallback: opciones vacías
  return labels.slice(0, 4).map((label, idx) => ({
    id: label.toLowerCase(),
    label,
    text: '',
  }))
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
    .order('question_number', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    throw new Error('No se pudieron cargar las preguntas')
  }

  // Filtrar: publicadas (is_published = true o null) y normalizar opciones
  return (data ?? [])
    .filter((q) => q.is_published === true || q.is_published === null)
    .map((q) => ({
      ...q,
      options: normalizeOptions(q.options),
    }))
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

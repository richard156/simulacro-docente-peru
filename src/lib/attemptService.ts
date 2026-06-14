import { supabase } from './supabase'
import type { ExamAttempt, QuestionAnswer, CaseProgress, AnswerRecord } from '@/types'

// ============================================================
// Servicio de datos para intentos de examen
// ============================================================

/**
 * Crea un nuevo intento de examen
 */
export async function createAttempt(
  userId: string,
  examId: string,
  mode: 'practice' | 'simulation' = 'simulation'
): Promise<ExamAttempt | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('exam_attempts')
    .insert({
      user_id: userId,
      exam_id: examId,
      attempt_mode: mode,
      status: 'in_progress',
      current_case_number: 1,
      current_question_number: 1,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating attempt:', error)
    throw new Error('No se pudo iniciar el intento de examen')
  }

  return data
}

/**
 * Obtiene el intento activo de un usuario para un examen específico
 */
export async function getActiveAttempt(userId: string, examId: string): Promise<ExamAttempt | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // No hay intento activo (no es un error real)
    if (error.code === 'PGRST116') return null
    console.error('Error fetching active attempt:', error)
    return null
  }

  return data
}

/**
 * Actualiza el progreso del intento (caso/pregunta actual)
 */
export async function updateAttemptProgress(
  attemptId: string,
  data: {
    current_case_number?: number
    current_question_number?: number
    total_questions_answered?: number
    total_correct_answers?: number
    total_incorrect_answers?: number
    total_score?: number
    max_score?: number
    accuracy_rate?: number
  }
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('exam_attempts')
    .update(data)
    .eq('id', attemptId)

  if (error) {
    console.error('Error updating attempt progress:', error)
    throw new Error('No se pudo actualizar el progreso')
  }
}

/**
 * Finaliza un intento de examen
 */
export async function completeAttempt(
  attemptId: string,
  status: 'completed' | 'time_up' | 'abandoned',
  totalTimeSeconds: number
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('exam_attempts')
    .update({
      status,
      completed_at: new Date().toISOString(),
      total_time_seconds: totalTimeSeconds,
    })
    .eq('id', attemptId)

  if (error) {
    console.error('Error completing attempt:', error)
    throw new Error('No se pudo finalizar el intento')
  }
}

/**
 * Guarda la respuesta de una pregunta
 */
export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOption: number | null,
  isCorrect: boolean | null,
  timeSpentSeconds: number | null
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('question_answers')
    .upsert({
      attempt_id: attemptId,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      answered_at: new Date().toISOString(),
    }, {
      onConflict: 'attempt_id, question_id',
    })

  if (error) {
    console.error('Error saving answer:', error)
    throw new Error('No se pudo guardar la respuesta')
  }
}

/**
 * Guarda múltiples respuestas (al finalizar el examen)
 */
export async function saveAllAnswers(
  attemptId: string,
  answers: Record<string, AnswerRecord>,
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const answersToInsert = Object.values(answers)
    .filter(a => a.selectedOptionIndex !== null)
    .map(a => ({
      attempt_id: attemptId,
      question_id: a.questionId,
      selected_option: a.selectedOptionIndex,
      is_correct: a.isCorrect,
      answered_at: a.answeredAt ?? new Date().toISOString(),
    }))

  if (answersToInsert.length === 0) return

  const { error } = await supabase
    .from('question_answers')
    .upsert(answersToInsert, {
      onConflict: 'attempt_id, question_id',
    })

  if (error) {
    console.error('Error saving all answers:', error)
    throw new Error('No se pudieron guardar las respuestas')
  }
}

/**
 * Obtiene los resultados de un intento
 */
export async function getAttemptResults(attemptId: string): Promise<{
  attempt: ExamAttempt | null
  answers: QuestionAnswer[]
  caseProgress: CaseProgress[]
}> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return { attempt: null, answers: [], caseProgress: [] }
  }

  const [attemptResult, answersResult, caseProgressResult] = await Promise.all([
    supabase.from('exam_attempts').select('*').eq('id', attemptId).single(),
    supabase.from('question_answers').select('*').eq('attempt_id', attemptId),
    supabase.from('case_progress').select('*').eq('attempt_id', attemptId),
  ])

  return {
    attempt: attemptResult.data,
    answers: answersResult.data ?? [],
    caseProgress: caseProgressResult.data ?? [],
  }
}

/**
 * Obtiene el historial de intentos de un usuario
 */
export async function getUserAttempts(userId: string): Promise<ExamAttempt[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['completed', 'time_up'])
    .order('completed_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching user attempts:', error)
    return []
  }

  return data ?? []
}

/**
 * Obtiene las estadísticas del dashboard
 */
export async function getUserStats(userId: string): Promise<{
  totalAttempts: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  totalCorrect: number
  totalQuestions: number
}> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    }
  }

  const { data, error } = await supabase
    .from('exam_attempts')
    .select('total_score, max_score, total_time_seconds, total_correct_answers, total_questions_answered')
    .eq('user_id', userId)
    .in('status', ['completed', 'time_up'])

  if (error || !data) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    }
  }

  const totalAttempts = data.length
  const scores = data
    .filter(a => a.total_score !== null && a.max_score !== null && a.max_score > 0)
    .map(a => (a.total_score! / a.max_score!) * 100)

  return {
    totalAttempts,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : 0,
    totalTimeSpent: data.reduce((acc, a) => acc + (a.total_time_seconds ?? 0), 0),
    totalCorrect: data.reduce((acc, a) => acc + (a.total_correct_answers ?? 0), 0),
    totalQuestions: data.reduce((acc, a) => acc + (a.total_questions_answered ?? 0), 0),
  }
}

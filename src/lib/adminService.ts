import { supabase } from './supabase'
import type { Exam, ExamCase, CaseQuestion } from '@/types'

// ============================================================
// Servicio de administración
// CRUD para exámenes, casos y preguntas
// ============================================================

// --- EXÁMENES ---

export async function fetchAllExams(): Promise<Exam[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all exams:', error)
    throw new Error('No se pudieron cargar los exámenes')
  }

  return data ?? []
}

export async function createExam(exam: {
  title: string
  description: string | null
  type: 'nombramiento' | 'ascenso' | 'desempeno'
  specialty: string | null
  duration_minutes: number
  passing_score: number
}): Promise<Exam | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('exams')
    .insert({
      title: exam.title,
      description: exam.description,
      type: exam.type,
      specialty: exam.specialty,
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score,
      difficulty_level: 'intermedio',
      total_cases: 0,
      total_questions: 0,
      is_published: false,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating exam:', error)
    throw new Error('No se pudo crear el examen')
  }

  return data
}

export async function updateExam(
  examId: string,
  exam: Partial<{
    title: string
    description: string
    type: 'nombramiento' | 'ascenso' | 'desempeno'
    specialty: string
    duration_minutes: number
    passing_score: number
    is_published: boolean
    is_active: boolean
  }>
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('exams')
    .update(exam)
    .eq('id', examId)

  if (error) {
    console.error('Error updating exam:', error)
    throw new Error('No se pudo actualizar el examen')
  }
}

export async function deleteExam(examId: string): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  // Primero eliminar casos y preguntas asociadas
  const cases = await fetchExamCasesAdmin(examId)
  for (const c of cases) {
    await deleteCaseQuestions(c.id)
  }

  if (cases.length > 0) {
    const { error: casesError } = await supabase
      .from('exam_cases')
      .delete()
      .eq('exam_id', examId)

    if (casesError) {
      console.error('Error deleting cases:', casesError)
      throw new Error('No se pudieron eliminar los casos')
    }
  }

  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)

  if (error) {
    console.error('Error deleting exam:', error)
    throw new Error('No se pudo eliminar el examen')
  }
}

// --- CASOS ---

export async function fetchExamCasesAdmin(examId: string): Promise<ExamCase[]> {
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

  return data ?? []
}

export async function createCase(caseData: {
  exam_id: string
  case_number: number
  title: string | null
  subject_area: string
  context_text: string
  key_points: Record<string, unknown> | null
}): Promise<ExamCase | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('exam_cases')
    .insert({
      exam_id: caseData.exam_id,
      case_number: caseData.case_number,
      title: caseData.title,
      subject_area: caseData.subject_area,
      context_text: caseData.context_text,
      context_type: 'texto',
      key_points: caseData.key_points,
      difficulty_level: 1,
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating case:', error)
    throw new Error('No se pudo crear el caso')
  }

  // Actualizar contador de casos en el examen
  await updateExamCaseCount(caseData.exam_id)

  return data
}

export async function updateCase(
  caseId: string,
  caseData: Partial<{
    case_number: number
    title: string
    subject_area: string
    context_text: string
    key_points: Record<string, unknown>
  }>
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('exam_cases')
    .update(caseData)
    .eq('id', caseId)

  if (error) {
    console.error('Error updating case:', error)
    throw new Error('No se pudo actualizar el caso')
  }
}

export async function deleteCase(caseId: string, examId: string): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  await deleteCaseQuestions(caseId)

  const { error } = await supabase
    .from('exam_cases')
    .delete()
    .eq('id', caseId)

  if (error) {
    console.error('Error deleting case:', error)
    throw new Error('No se pudo eliminar el caso')
  }

  await updateExamCaseCount(examId)
}

async function deleteCaseQuestions(caseId: string): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('case_questions')
    .delete()
    .eq('case_id', caseId)

  if (error) {
    console.error('Error deleting questions:', error)
    throw new Error('No se pudieron eliminar las preguntas')
  }
}

async function updateExamCaseCount(examId: string): Promise<void> {
  if (!supabase) return

  const { count, error: countError } = await supabase
    .from('exam_cases')
    .select('*', { count: 'exact', head: true })
    .eq('exam_id', examId)

  if (!countError) {
    await supabase
      .from('exams')
      .update({ total_cases: count ?? 0 })
      .eq('id', examId)
  }
}

// --- PREGUNTAS ---

export async function fetchCaseQuestionsAdmin(caseId: string): Promise<CaseQuestion[]> {
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

  return data ?? []
}

export async function createQuestion(questionData: {
  case_id: string
  question_number: number
  statement: string
  options: { id: string; label: string; text: string }[]
  correct_option_index: number
  explanation: string
  pedagogical_reference: string | null
}): Promise<CaseQuestion | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  const { data, error } = await supabase
    .from('case_questions')
    .insert({
      case_id: questionData.case_id,
      question_number: questionData.question_number,
      statement: questionData.statement,
      options: questionData.options,
      correct_option_index: questionData.correct_option_index,
      explanation: questionData.explanation,
      pedagogical_reference: questionData.pedagogical_reference,
      explanation_type: 'detallada',
      question_type: 'opcion_multiple',
      cognitive_level: 'aplicacion',
      difficulty_level: 1,
      estimated_time_seconds: 120,
      points: 1,
      times_answered: 0,
      times_correctly_answered: 0,
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating question:', error)
    throw new Error('No se pudo crear la pregunta')
  }

  // Actualizar contador de preguntas en el examen
  await updateExamQuestionCount(questionData.case_id)

  return data
}

export async function updateQuestion(
  questionId: string,
  questionData: Partial<{
    question_number: number
    statement: string
    options: { id: string; label: string; text: string }[]
    correct_option_index: number
    explanation: string
    pedagogical_reference: string
  }>
): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('case_questions')
    .update(questionData)
    .eq('id', questionId)

  if (error) {
    console.error('Error updating question:', error)
    throw new Error('No se pudo actualizar la pregunta')
  }
}

export async function deleteQuestion(questionId: string, caseId: string): Promise<void> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return
  }

  const { error } = await supabase
    .from('case_questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    console.error('Error deleting question:', error)
    throw new Error('No se pudo eliminar la pregunta')
  }

  await updateExamQuestionCount(caseId)
}

async function updateExamQuestionCount(caseId: string): Promise<void> {
  if (!supabase) return

  // Obtener el exam_id del caso
  const { data: caseData } = await supabase
    .from('exam_cases')
    .select('exam_id')
    .eq('id', caseId)
    .single()

  if (!caseData) return

  // Contar todas las preguntas de todos los casos del examen
  const { data: cases } = await supabase
    .from('exam_cases')
    .select('id')
    .eq('exam_id', caseData.exam_id)

  if (!cases || cases.length === 0) return

  const caseIds = cases.map(c => c.id)
  const { count, error: countError } = await supabase
    .from('case_questions')
    .select('*', { count: 'exact', head: true })
    .in('case_id', caseIds)

  if (!countError) {
    await supabase
      .from('exams')
      .update({ total_questions: count ?? 0 })
      .eq('id', caseData.exam_id)
  }
}

// --- DOCUMENTOS ---

export async function uploadPDF(
  file: File,
  metadata: {
    title: string
    description: string | null
    exam_id: string | null
  }
): Promise<{ url: string; id: string } | null> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return null
  }

  // Subir archivo a Storage
  const fileName = `${Date.now()}_${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Error uploading PDF:', uploadError)
    throw new Error('No se pudo subir el PDF')
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  // Guardar metadata en la tabla documents
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: metadata.title,
      description: metadata.description,
      file_url: urlData?.publicUrl ?? '',
      file_type: 'pdf',
      file_size: file.size,
      exam_id: metadata.exam_id,
      is_processed: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving document metadata:', error)
    throw new Error('No se pudo guardar la metadata del documento')
  }

  return {
    url: urlData?.publicUrl ?? '',
    id: data.id,
  }
}

export async function fetchDocuments(): Promise<any[]> {
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible - modo offline')
    return []
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error('No se pudieron cargar los documentos')
  }

  return data ?? []
}

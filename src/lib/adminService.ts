import { supabase } from '@/lib/supabase'
import type { Exam, ExamCase, CaseQuestion } from '@/types'

// ============================================
// EXÁMENES
// ============================================

export async function fetchAllExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exams:', error)
    throw new Error('No se pudieron cargar los exámenes')
  }

  return data || []
}

export async function fetchExamById(examId: string): Promise<Exam | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (error) {
    console.error('Error fetching exam:', error)
    throw new Error('No se pudo cargar el examen')
  }

  return data
}

export async function createExam(exam: {
  title: string
  description: string
  type: 'nombramiento' | 'ascenso' | 'desempeno'
  specialty: string
  duration_minutes: number
  passing_score: number
  is_published?: boolean
  is_active?: boolean
}): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .insert([{
      ...exam,
      is_published: exam.is_published ?? false,
      is_active: exam.is_active ?? true,
    }])
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
  updates: Partial<{
    title: string
    description: string
    type: 'nombramiento' | 'ascenso' | 'desempeno'
    specialty: string
    duration_minutes: number
    passing_score: number
    is_published: boolean
    is_active: boolean
  }>
): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', examId)
    .select()
    .single()

  if (error) {
    console.error('Error updating exam:', error)
    throw new Error('No se pudo actualizar el examen')
  }

  return data
}

export async function deleteExam(examId: string): Promise<void> {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)

  if (error) {
    console.error('Error deleting exam:', error)
    throw new Error('No se pudo eliminar el examen')
  }
}

// ============================================
// CASOS
// ============================================

export async function fetchExamCasesAdmin(examId: string): Promise<ExamCase[]> {
  const { data, error } = await supabase
    .from('exam_cases')
    .select('*')
    .eq('exam_id', examId)
    .order('case_number', { ascending: true })

  if (error) {
    console.error('Error fetching cases:', error)
    throw new Error('No se pudieron cargar los casos')
  }

  return data || []
}

export async function createCase(caseData: {
  exam_id: string
  case_number: number
  title: string | null
  subject_area: string
  context_text: string
  key_points: Record<string, unknown> | null
}): Promise<ExamCase> {
  const { data, error } = await supabase
    .from('exam_cases')
    .insert([caseData])
    .select()
    .single()

  if (error) {
    console.error('Error creating case:', error)
    throw new Error('No se pudo crear el caso')
  }

  return data
}

export async function updateCase(
  caseId: string,
  updates: Partial<{
    case_number: number
    title: string
    subject_area: string
    context_text: string
    key_points: Record<string, unknown>
  }>
): Promise<void> {
  const { error } = await supabase
    .from('exam_cases')
    .update(updates)
    .eq('id', caseId)

  if (error) {
    console.error('Error updating case:', error)
    throw new Error('No se pudo actualizar el caso')
  }
}

export async function deleteCase(caseId: string): Promise<void> {
  const { error } = await supabase
    .from('exam_cases')
    .delete()
    .eq('id', caseId)

  if (error) {
    console.error('Error deleting case:', error)
    throw new Error('No se pudo eliminar el caso')
  }
}

// ============================================
// PREGUNTAS
// ============================================

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


export async function fetchCaseQuestionsAdmin(caseId: string): Promise<CaseQuestion[]> {
  const { data, error } = await supabase
    .from('case_questions')
    .select('*')
    .eq('case_id', caseId)
    .order('question_number', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    throw new Error('No se pudieron cargar las preguntas')
  }

  // Normalizar opciones para que siempre tengan el formato QuestionOption[]
  return (data || []).map((q) => ({
    ...q,
    options: normalizeOptions(q.options),
  }))
}

export async function createQuestion(question: {
  case_id: string
  question_number: number
  statement: string
  options: { id: string; label: string; text: string }[]
  correct_answer: string
  explanation: string
}): Promise<CaseQuestion> {
  // Convertir correct_answer (letra) a correct_option_index (número)
  const correctOptionIndex = question.options.findIndex(
    (o) => o.label === question.correct_answer
  )

  // Guardar solo los textos de las opciones en la BD (string[])
  const dbOptions = question.options.map(o => o.text)

  const { data, error } = await supabase
    .from('case_questions')
    .insert([{
      case_id: question.case_id,
      question_number: question.question_number,
      statement: question.statement,
      options: dbOptions,
      correct_option_index: correctOptionIndex >= 0 ? correctOptionIndex : 0,
      explanation: question.explanation,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating question:', error)
    throw new Error('No se pudo crear la pregunta')
  }

  return data
}

export async function updateQuestion(
  questionId: string,
  updates: Partial<{
    question_number: number
    statement: string
    options: { id: string; label: string; text: string }[]
    correct_answer: string
    explanation: string
  }>
): Promise<void> {
  // Preparar datos para la BD
  const dbUpdates: Record<string, unknown> = {}
  
  // Solo incluir campos que existen en la BD
  if (updates.question_number !== undefined) dbUpdates.question_number = updates.question_number
  if (updates.statement !== undefined) dbUpdates.statement = updates.statement
  if (updates.explanation !== undefined) dbUpdates.explanation = updates.explanation
  
  // Guardar solo los textos de las opciones en la BD (string[])
  if (updates.options !== undefined) {
    dbUpdates.options = updates.options.map(o => o.text)
  }
  
  // Convertir correct_answer (letra) a correct_option_index (número)
  if (updates.correct_answer !== undefined && updates.options) {
    const correctOptionIndex = updates.options.findIndex(
      (o) => o.label === updates.correct_answer
    )
    dbUpdates.correct_option_index = correctOptionIndex >= 0 ? correctOptionIndex : 0
  }

  const { error } = await supabase
    .from('case_questions')
    .update(dbUpdates)
    .eq('id', questionId)

  if (error) {
    console.error('Error updating question:', error)
    throw new Error('No se pudo actualizar la pregunta')
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('case_questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    console.error('Error deleting question:', error)
    throw new Error('No se pudo eliminar la pregunta')
  }
}

// ============================================
// PDF
// ============================================

export async function uploadPDF(
  file: File,
  examId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; fileName: string }> {
  // Validar tipo de archivo
  if (!file.type.includes('pdf')) {
    throw new Error('Solo se permiten archivos PDF')
  }

  // Validar tamaño (50MB máximo)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 50MB.')
  }

  // Subir archivo a Storage
  const fileName = `${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
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

  const publicUrl = urlData.publicUrl

  // Guardar referencia en la base de datos
  const { error: dbError } = await supabase
    .from('exam_documents')
    .insert([
      {
        exam_id: examId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
      },
    ])

  if (dbError) {
    console.error('Error saving document reference:', dbError)
    // Intentar limpiar el archivo subido
    await supabase.storage.from('documents').remove([fileName])
    throw new Error('No se pudo guardar la referencia del documento')
  }

  if (onProgress) {
    onProgress(100)
  }

  return { url: publicUrl, fileName: file.name }
}

export async function fetchExamDocuments(
  examId: string
): Promise<{ id: string; file_name: string; file_url: string; file_size: number; created_at: string }[]> {
  const { data, error } = await supabase
    .from('exam_documents')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error('No se pudieron cargar los documentos')
  }

  return data || []
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('exam_documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error('No se pudo eliminar el documento')
  }
}

// ============================================
// USUARIOS (Admin)
// ============================================

export async function fetchAllUsers(): Promise<
  { id: string; email: string; full_name: string; role: string; created_at: string }[]
> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    throw new Error('No se pudieron cargar los usuarios')
  }

  return data || []
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user'
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('No se pudo actualizar el rol del usuario')
  }
}

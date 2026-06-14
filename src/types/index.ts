// ============================================================
// Tipos para el Simulacro Docente Perú
// Basado en esquema de Supabase
// ============================================================

// --- Examen ---
export interface Exam {
  id: string
  title: string
  description: string | null
  type: 'nombramiento' | 'ascenso' | 'desempeno'
  specialty: string | null
  difficulty_level: string
  total_cases: number
  total_questions: number
  duration_minutes: number
  passing_score: number
  year: number | null
  is_published: boolean
  is_active: boolean
  instructions: string | null
  created_at: string
  updated_at: string
}

// --- Caso dentro de un examen ---
export interface ExamCase {
  id: string
  exam_id: string
  case_number: number
  title: string | null
  subject_area: string
  context_text: string
  context_type: string
  word_count: number | null
  difficulty_level: number
  source: string | null
  pedagogical_focus: string | null
  key_points: Record<string, unknown> | null
  grade_level: string | null
  curricular_area: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

// --- Pregunta dentro de un caso ---
export interface CaseQuestion {
  id: string
  case_id: string
  question_number: number
  statement: string
  options: QuestionOption[]
  correct_option_index: number
  explanation: string
  explanation_type: string
  relevant_paragraph_index: number | null
  relevant_text_snippet: string | null
  pedagogical_reference: string | null
  reference_url: string | null
  legal_basis: string | null
  question_type: string
  cognitive_level: string | null
  difficulty_level: number
  estimated_time_seconds: number
  topics: string[] | null
  competencies: string[] | null
  capabilities: string[] | null
  points: number
  times_answered: number
  times_correctly_answered: number
  success_rate: number | null
  average_time_seconds: number | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  id: string
  label: string // 'A' | 'B' | 'C' | 'D'
  text: string
}

// --- Respuesta del usuario ---
export interface AnswerRecord {
  questionId: string
  selectedOptionIndex: number | null
  isCorrect: boolean | null
  answeredAt: string | null
}

// --- Estado de feedback ---
export type FeedbackStatus = 'idle' | 'correct' | 'incorrect'

export interface FeedbackState {
  status: FeedbackStatus
  selectedOptionIndex: number | null
  correctOptionIndex: number | null
  explanation: string
  pedagogicalReference?: string | null
}

// --- Store de Zustand ---
export interface ExamState {
  // Datos del examen
  examData: Exam | null
  cases: ExamCase[]
  questions: Record<string, CaseQuestion[]> // caseId -> questions

  // Navegación
  currentCaseIndex: number
  currentQuestionIndex: number

  // Respuestas
  answers: Record<string, AnswerRecord> // questionId -> answer

  // Feedback
  feedbackState: FeedbackState

  // Temporizador
  timeRemaining: number
  isTimerRunning: boolean

  // Acciones
  loadExam: (exam: Exam, cases: ExamCase[], questions: Record<string, CaseQuestion[]>) => void
  answerQuestion: (questionId: string, optionIndex: number) => void
  checkAnswer: () => void
  navigateToQuestion: (caseIndex: number, questionIndex: number) => void
  navigateToCase: (caseIndex: number) => void
  nextQuestion: () => void
  tickTimer: () => void
  startTimer: () => void
  stopTimer: () => void
  resetFeedback: () => void
  resetExam: () => void
}

// --- Resultados ---
export interface ExamResult {
  attemptId: string
  examId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  answers: AnswerRecord[]
  startedAt: string
  completedAt: string
  timeSpent: number
}

// --- Usuario ---
export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role?: string | null
  specialty?: string | null
  region?: string | null
  teaching_level?: string | null
  years_experience?: number
  is_onboarded?: boolean
  created_at: string
  updated_at?: string
}

// --- Tipos de Supabase (para respuestas de API) ---
export interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  attempt_mode: 'practice' | 'simulation'
  status: 'in_progress' | 'completed' | 'abandoned' | 'time_up'
  current_case_number: number
  current_question_number: number
  total_score: number | null
  max_score: number | null
  total_questions_answered: number
  total_correct_answers: number
  total_incorrect_answers: number
  accuracy_rate: number | null
  started_at: string
  completed_at: string | null
  total_time_seconds: number | null
}

export interface QuestionAnswer {
  id: string
  attempt_id: string
  question_id: string
  selected_option: number | null
  is_correct: boolean | null
  time_spent_seconds: number | null
  answered_at: string
  feedback_viewed: boolean
  was_changed: boolean
  previous_option: number | null
}

export interface CaseProgress {
  id: string
  attempt_id: string
  case_id: string
  case_number: number
  case_status: string
  total_questions: number
  answered_questions: number
  correct_answers: number
  incorrect_answers: number
  case_score: number
  case_max_score: number | null
  time_spent_seconds: number
}

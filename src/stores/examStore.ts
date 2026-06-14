import { create } from 'zustand'
import type { ExamState, Exam, ExamCase, CaseQuestion, AnswerRecord, FeedbackState } from '@/types'

const initialFeedbackState: FeedbackState = {
  status: 'idle',
  selectedOptionIndex: null,
  correctOptionIndex: null,
  explanation: '',
  pedagogicalReference: undefined,
}

export const useExamStore = create<ExamState>((set, get) => ({
  // Estado inicial
  examData: null,
  cases: [],
  questions: {},
  currentCaseIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  feedbackState: { ...initialFeedbackState },
  timeRemaining: 0,
  isTimerRunning: false,

  // Cargar examen completo
  loadExam: (exam: Exam, cases: ExamCase[], questions: Record<string, CaseQuestion[]>) => {
    set({
      examData: exam,
      cases,
      questions,
      currentCaseIndex: 0,
      currentQuestionIndex: 0,
      answers: {},
      feedbackState: { ...initialFeedbackState },
      timeRemaining: exam.duration_minutes * 60,
      isTimerRunning: true,
    })
  },

  // Registrar respuesta seleccionada (por índice)
  answerQuestion: (questionId: string, optionIndex: number) => {
    const { answers } = get()
    const existing = answers[questionId]
    const record: AnswerRecord = {
      questionId,
      selectedOptionIndex: optionIndex,
      isCorrect: existing?.isCorrect ?? null,
      answeredAt: existing?.answeredAt ?? null,
    }
    set({
      answers: { ...answers, [questionId]: record },
      feedbackState: { ...initialFeedbackState },
    })
  },

  // Verificar respuesta actual
  checkAnswer: () => {
    const { currentCaseIndex, currentQuestionIndex, cases, questions, answers } = get()
    const currentCase = cases[currentCaseIndex]
    if (!currentCase) return

    const caseQuestions = questions[currentCase.id]
    if (!caseQuestions) return

    const currentQuestion = caseQuestions[currentQuestionIndex]
    if (!currentQuestion) return

    const answer = answers[currentQuestion.id]
    const selectedOptionIndex = answer?.selectedOptionIndex ?? null

    if (selectedOptionIndex === null) return // No ha seleccionado nada

    const isCorrect = selectedOptionIndex === currentQuestion.correct_option_index

    // Actualizar el registro de respuesta
    const updatedAnswer: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedOptionIndex,
      isCorrect,
      answeredAt: new Date().toISOString(),
    }

    set({
      answers: { ...answers, [currentQuestion.id]: updatedAnswer },
      feedbackState: {
        status: isCorrect ? 'correct' : 'incorrect',
        selectedOptionIndex,
        correctOptionIndex: currentQuestion.correct_option_index,
        explanation: currentQuestion.explanation,
        pedagogicalReference: currentQuestion.pedagogical_reference,
      },
    })
  },

  // Navegar a una pregunta específica
  navigateToQuestion: (caseIndex: number, questionIndex: number) => {
    const { cases, questions } = get()
    const targetCase = cases[caseIndex]
    if (!targetCase) return

    const caseQuestions = questions[targetCase.id]
    if (!caseQuestions || !caseQuestions[questionIndex]) return

    set({
      currentCaseIndex: caseIndex,
      currentQuestionIndex: questionIndex,
      feedbackState: { ...initialFeedbackState },
    })
  },

  // Navegar a un caso específico
  navigateToCase: (caseIndex: number) => {
    const { cases } = get()
    if (!cases[caseIndex]) return

    set({
      currentCaseIndex: caseIndex,
      currentQuestionIndex: 0,
      feedbackState: { ...initialFeedbackState },
    })
  },

  // Ir a la siguiente pregunta
  nextQuestion: () => {
    const { currentCaseIndex, currentQuestionIndex, cases, questions } = get()
    const currentCase = cases[currentCaseIndex]
    if (!currentCase) return

    const caseQuestions = questions[currentCase.id]
    if (!caseQuestions) return

    const nextQuestionIndex = currentQuestionIndex + 1

    if (nextQuestionIndex < caseQuestions.length) {
      // Siguiente pregunta en el mismo caso
      set({
        currentQuestionIndex: nextQuestionIndex,
        feedbackState: { ...initialFeedbackState },
      })
    } else {
      // Pasar al siguiente caso
      const nextCaseIndex = currentCaseIndex + 1
      if (nextCaseIndex < cases.length) {
        set({
          currentCaseIndex: nextCaseIndex,
          currentQuestionIndex: 0,
          feedbackState: { ...initialFeedbackState },
        })
      }
      // Si no hay más casos, no hacer nada (el componente manejará finalizar)
    }
  },

  // Temporizador
  tickTimer: () => {
    const { timeRemaining, isTimerRunning } = get()
    if (!isTimerRunning || timeRemaining <= 0) {
      if (timeRemaining <= 0) {
        set({ isTimerRunning: false })
      }
      return
    }
    set({ timeRemaining: timeRemaining - 1 })
  },

  startTimer: () => set({ isTimerRunning: true }),
  stopTimer: () => set({ isTimerRunning: false }),

  resetFeedback: () => set({ feedbackState: { ...initialFeedbackState } }),

  resetExam: () => {
    set({
      examData: null,
      cases: [],
      questions: {},
      currentCaseIndex: 0,
      currentQuestionIndex: 0,
      answers: {},
      feedbackState: { ...initialFeedbackState },
      timeRemaining: 0,
      isTimerRunning: false,
    })
  },
}))

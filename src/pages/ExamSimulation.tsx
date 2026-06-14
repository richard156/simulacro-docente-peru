import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExamStore } from '@/stores/examStore'
import { ExamHeader } from '@/components/exam/ExamHeader'
import { CasePanel } from '@/components/exam/CasePanel'
import { QuestionPanel } from '@/components/exam/QuestionPanel'
import { CaseNavigator } from '@/components/exam/CaseNavigator'
import { useAuth } from '@/hooks/useAuth'
import { loadFullExam } from '@/lib/examService'
import { createAttempt, saveAllAnswers, completeAttempt, updateAttemptProgress } from '@/lib/attemptService'
import { Layers, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ExamSimulation() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    loadExam, resetExam, examData, questions, answers,
    timeRemaining, stopTimer,
  } = useExamStore()
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(false)

  // Cargar datos del examen desde Supabase
  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      if (!examId) {
        setError('ID de examen no válido')
        setLoading(false)
        return
      }

      try {
        // Intentar cargar desde Supabase
        const fullExam = await loadFullExam(examId)

        if (cancelled) return

        if (fullExam && fullExam.exam && fullExam.cases.length > 0) {
          loadExam(fullExam.exam, fullExam.cases, fullExam.questions)

          // Crear intento en Supabase si hay usuario autenticado
          if (user?.id) {
            try {
              const attempt = await createAttempt(user.id, examId, 'simulation')
              if (attempt) {
                setAttemptId(attempt.id)
              }
            } catch {
              // Si falla la creación del intento, continuar igual (modo offline)
              console.warn('No se pudo crear el intento en Supabase, modo offline')
            }
          }
        } else {
          // Fallback: mostrar error si no hay datos
          setError('No se encontró el examen solicitado')
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading exam:', err)
          setError('Error al cargar el examen. Intenta de nuevo.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
      resetExam()
    }
  }, [examId, loadExam, resetExam, user?.id])

  // Calcular resultados
  const calculateResults = useCallback(() => {
    let totalCorrect = 0
    let totalAnswered = 0
    let totalScore = 0
    let maxScore = 0

    Object.values(questions).forEach(caseQuestions => {
      caseQuestions.forEach(q => {
        const answer = answers[q.id]
        maxScore += q.points ?? 1
        if (answer?.isCorrect === true) {
          totalCorrect++
          totalScore += q.points ?? 1
        }
        if (answer?.selectedOptionIndex !== null && answer?.selectedOptionIndex !== undefined) {
          totalAnswered++
        }
      })
    })

    return {
      totalCorrect,
      totalAnswered,
      totalScore,
      maxScore,
      totalQuestions: Object.values(questions).reduce((acc, qs) => acc + qs.length, 0),
      accuracyRate: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    }
  }, [questions, answers])

  // Finalizar examen
  const handleFinish = useCallback(async () => {
    if (isFinishing) return
    setIsFinishing(true)
    stopTimer()

    const results = calculateResults()
    const totalTimeSeconds = examData ? (examData.duration_minutes * 60) - timeRemaining : 0

    // Guardar resultados en Supabase si hay intento
    if (attemptId) {
      try {
        await saveAllAnswers(attemptId, answers)
        await updateAttemptProgress(attemptId, {
          total_questions_answered: results.totalAnswered,
          total_correct_answers: results.totalCorrect,
          total_incorrect_answers: results.totalAnswered - results.totalCorrect,
          total_score: results.totalScore,
          max_score: results.maxScore,
          accuracy_rate: results.accuracyRate,
        })
        await completeAttempt(attemptId, 'completed', totalTimeSeconds)
      } catch (err) {
        console.error('Error saving results:', err)
        // Continuar aunque falle el guardado
      }
    }

    // Navegar a resultados
    navigate(`/results/${attemptId ?? 'local'}`, {
      state: {
        results,
        examTitle: examData?.title,
        timeSpent: totalTimeSeconds,
      },
    })
  }, [isFinishing, stopTimer, calculateResults, examData, timeRemaining, attemptId, answers, questions, navigate])

  // Manejar tiempo agotado
  useEffect(() => {
    if (timeRemaining <= 0 && examData && !isFinishing) {
      handleFinish()
    }
  }, [timeRemaining, examData, isFinishing, handleFinish])

  // Diálogo de confirmación para finalizar
  const FinishDialog = () => {
    if (!showFinishDialog) return null

    const results = calculateResults()

    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFinishDialog(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">¿Finalizar examen?</h3>
            </div>

            <p className="text-sm text-gray-600">
              Estás a punto de finalizar el examen. Las preguntas respondidas se guardarán automáticamente.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Preguntas respondidas:</span>
                <span className="font-medium text-gray-900">{results.totalAnswered} de {results.totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Respuestas correctas:</span>
                <span className="font-medium text-green-600">{results.totalCorrect}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Precisión actual:</span>
                <span className="font-medium text-gray-900">{results.accuracyRate}%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFinishDialog(false)}
                className="flex-1"
              >
                Seguir respondiendo
              </Button>
              <Button
                onClick={() => {
                  setShowFinishDialog(false)
                  handleFinish()
                }}
                disabled={isFinishing}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isFinishing ? 'Finalizando...' : 'Finalizar'}
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <p className="text-gray-500 text-sm">Cargando examen...</p>
        </div>
      </div>
    )
  }

  if (error || !examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium">{error ?? 'No se pudo cargar el examen'}</p>
          <p className="text-gray-500 text-sm">Verifica que el examen exista y esté publicado.</p>
          <Button
            onClick={() => navigate('/exams')}
            variant="outline"
            className="mt-2"
          >
            Volver a exámenes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <ExamHeader onFinish={() => setShowFinishDialog(true)} />

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo - Caso */}
        <div className="hidden lg:flex lg:w-[40%] border-r bg-white">
          <CasePanel />
        </div>

        {/* Panel derecho - Pregunta */}
        <div className="flex-1 flex flex-col min-w-0">
          <QuestionPanel />
        </div>

        {/* Botón para abrir navegador de casos en móvil */}
        <button
          onClick={() => setNavigatorOpen(true)}
          className="fixed bottom-4 right-4 lg:hidden z-30 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
        >
          <Layers className="h-5 w-5" />
        </button>

        {/* Navigator (drawer en móvil, sidebar en desktop) */}
        <CaseNavigator
          isOpen={navigatorOpen}
          onClose={() => setNavigatorOpen(false)}
        />
      </div>

      {/* Diálogo de confirmación */}
      <FinishDialog />
    </div>
  )
}

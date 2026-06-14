import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, ArrowLeft, Download, Award, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAttemptResults } from '@/lib/attemptService'

interface ResultsData {
  totalCorrect: number
  totalAnswered: number
  totalScore: number
  maxScore: number
  totalQuestions: number
  accuracyRate: number
}

interface LocationState {
  results?: ResultsData
  examTitle?: string
  timeSpent?: number
}

export function ExamResults() {
  const navigate = useNavigate()
  const { attemptId } = useParams<{ attemptId: string }>()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<ResultsData | null>(state?.results ?? null)
  const [examTitle] = useState(state?.examTitle ?? 'Resultados del Examen')
  const [timeSpent, setTimeSpent] = useState(state?.timeSpent ?? 0)

  // Cargar resultados desde Supabase si no vienen por state
  useEffect(() => {
    if (results) {
      setLoading(false)
      return
    }

    if (!attemptId || attemptId === 'local') {
      setLoading(false)
      return
    }

    const loadResults = async () => {
      try {
        const { attempt } = await getAttemptResults(attemptId)
        if (attempt) {
          setResults({
            totalCorrect: attempt.total_correct_answers ?? 0,
            totalAnswered: attempt.total_questions_answered ?? 0,
            totalScore: attempt.total_score ?? 0,
            maxScore: attempt.max_score ?? 0,
            totalQuestions: attempt.total_questions_answered ?? 0,
            accuracyRate: attempt.accuracy_rate ?? 0,
          })
          setTimeSpent(attempt.total_time_seconds ?? 0)
        }
      } catch (err) {
        console.error('Error loading results:', err)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [attemptId, results])

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  // Si no hay resultados, mostrar estado vacío
  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Award className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">No se encontraron resultados para este intento.</p>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mt-2"
          >
            Volver al dashboard
          </Button>
        </div>
      </div>
    )
  }

  const { totalCorrect, totalAnswered, totalScore, maxScore, totalQuestions, accuracyRate } = results
  const percentage = accuracyRate

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreRing = () => {
    if (percentage >= 80) return 'stroke-green-500'
    if (percentage >= 60) return 'stroke-yellow-500'
    return 'stroke-red-500'
  }

  // Generar detalle de preguntas basado en respuestas correctas/incorrectas
  const questions = Array.from({ length: totalQuestions }, (_, i) => ({
    number: i + 1,
    correct: i < totalCorrect,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2 text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/exams')}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Nuevo intento
          </Button>
        </div>

        {/* Score principal */}
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Círculo de puntaje */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    className={getScoreRing()}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${percentage * 3.39} 339`}
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={cn('text-3xl font-bold', getScoreColor())}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {examTitle}
                </h2>
                <p className={cn(
                  'text-lg font-semibold mt-1',
                  getScoreColor()
                )}>
                  {percentage >= 80 ? '¡Excelente resultado!' :
                   percentage >= 60 ? 'Buen resultado' :
                   'Puedes mejorar'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalCorrect} de {totalQuestions} preguntas correctas
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Puntaje: {totalScore}/{maxScore}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">⏱</span>
                  Tiempo: {formatTime(timeSpent)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de respuestas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Resumen de Respuestas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-2xl font-bold text-green-600">{totalCorrect}</p>
                <p className="text-xs text-green-700 mt-1">Correctas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-2xl font-bold text-red-600">{totalAnswered - totalCorrect}</p>
                <p className="text-xs text-red-700 mt-1">Incorrectas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-2xl font-bold text-gray-600">{totalQuestions - totalAnswered}</p>
                <p className="text-xs text-gray-600 mt-1">Sin responder</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                <p className="text-xs text-blue-700 mt-1">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de preguntas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Detalle de Preguntas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {questions.map((q) => (
                <div
                  key={q.number}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg border text-xs',
                    q.correct
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  )}
                >
                  <span className="font-medium">{q.number}</span>
                  {q.correct ? (
                    <CheckCircle2 className="h-3 w-3 mt-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Botón de descarga */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              alert('Funcionalidad de descarga de certificado próximamente.')
            }}
          >
            <Download className="h-4 w-4" />
            Descargar certificado
          </Button>
        </div>
      </div>
    </div>
  )
}

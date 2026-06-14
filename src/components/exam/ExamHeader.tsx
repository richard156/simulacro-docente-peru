import { useEffect, useRef, useState } from 'react'
import { useExamStore } from '@/stores/examStore'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Clock, Flag, ChevronLeft, Timer, TimerReset } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ExamHeaderProps {
  onFinish: () => void
}

type TimerMode = 'countdown' | 'elapsed'

export function ExamHeader({ onFinish }: ExamHeaderProps) {
  const navigate = useNavigate()
  const {
    examData, cases, currentCaseIndex, currentQuestionIndex,
    questions, answers, timeRemaining, tickTimer,
  } = useExamStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timerMode, setTimerMode] = useState<TimerMode>('countdown')

  // Iniciar temporizador
  useEffect(() => {
    timerRef.current = setInterval(() => {
      tickTimer()
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [tickTimer])

  // Calcular progreso
  const totalQuestions = Object.values(questions).reduce((acc, qs) => acc + qs.length, 0)
  const answeredQuestions = Object.values(answers).filter(a => a.selectedOptionIndex !== null).length
  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

  // Tiempo transcurrido
  const totalDuration = examData ? examData.duration_minutes * 60 : 0
  const elapsedTime = totalDuration - timeRemaining

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Color del tiempo según urgencia (solo en countdown)
  const getTimeColor = () => {
    if (timerMode === 'elapsed') return 'text-gray-600'
    if (!examData) return 'text-gray-600'
    const percentage = timeRemaining / (examData.duration_minutes * 60)
    if (percentage < 0.1) return 'text-red-600'
    if (percentage < 0.25) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getTimeBg = () => {
    if (timerMode === 'elapsed') return 'bg-gray-100'
    if (!examData) return 'bg-gray-100'
    const percentage = timeRemaining / (examData.duration_minutes * 60)
    if (percentage < 0.1) return 'bg-red-50'
    if (percentage < 0.25) return 'bg-yellow-50'
    return 'bg-gray-100'
  }

  const toggleTimerMode = () => {
    setTimerMode(prev => prev === 'countdown' ? 'elapsed' : 'countdown')
  }

  const currentCase = cases[currentCaseIndex]
  const caseQuestions = currentCase ? questions[currentCase.id] : []
  const currentQuestion = caseQuestions ? caseQuestions[currentQuestionIndex] : null

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo y título */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de salir? Perderás el progreso actual.')) {
                  navigate('/exams')
                }
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {examData?.title ?? 'Simulacro'}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                Caso {currentCaseIndex + 1} de {cases.length}
                {currentQuestion && ` · Pregunta ${currentQuestionIndex + 1} de ${caseQuestions.length}`}
              </p>
            </div>
          </div>

          {/* Progreso y tiempo */}
          <div className="flex items-center gap-4">
            {/* Barra de progreso (escritorio) */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Flag className="h-4 w-4" />
                <span>{answeredQuestions}/{totalQuestions}</span>
              </div>
              <div className="w-24">
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Temporizador con botón de cambio */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTimerMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTimeBg()} hover:opacity-80 transition-opacity cursor-pointer`}
                title={timerMode === 'countdown' ? 'Ver tiempo transcurrido' : 'Ver tiempo restante'}
              >
                {timerMode === 'countdown' ? (
                  <Timer className={`h-4 w-4 ${getTimeColor()}`} />
                ) : (
                  <TimerReset className="h-4 w-4 text-gray-600" />
                )}
                <span className={`text-sm font-mono font-bold ${getTimeColor()}`}>
                  {timerMode === 'countdown'
                    ? formatTime(timeRemaining)
                    : formatTime(elapsedTime)
                  }
                </span>
              </button>
            </div>

            {/* Botón finalizar */}
            <Button
              onClick={onFinish}
              variant="outline"
              size="sm"
              className="text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Finalizar
            </Button>
          </div>
        </div>

        {/* Barra de progreso móvil */}
        <div className="sm:hidden mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{answeredQuestions}/{totalQuestions}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    </header>
  )
}

import { useExamStore } from '@/stores/examStore'
import { Button } from '@/components/ui/button'
import { FeedbackCard } from '@/components/exam/FeedbackCard'
import { HTMLContent } from '@/components/ui/html-content'
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuestionPanel() {
  const {
    cases, questions, currentCaseIndex, currentQuestionIndex,
    answers, feedbackState, answerQuestion, checkAnswer,
    nextQuestion, navigateToQuestion,
  } = useExamStore()

  const currentCase = cases[currentCaseIndex]
  if (!currentCase) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400">No hay casos disponibles</p>
      </div>
    )
  }

  const caseQuestions = questions[currentCase.id]
  if (!caseQuestions || caseQuestions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400">No hay preguntas para este caso</p>
      </div>
    )
  }

  const currentQuestion = caseQuestions[currentQuestionIndex]
  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400">Pregunta no encontrada</p>
      </div>
    )
  }

  const answer = answers[currentQuestion.id]
  const selectedOptionIndex = answer?.selectedOptionIndex ?? null
  const hasAnswered = selectedOptionIndex !== null
  const hasChecked = feedbackState.status !== 'idle'
  const isCorrect = feedbackState.status === 'correct'
  const isLastQuestion = currentCaseIndex === cases.length - 1 &&
    currentQuestionIndex === caseQuestions.length - 1

  const handleOptionClick = (optionIndex: number) => {
    if (hasChecked) return // No permitir cambiar después de verificar
    answerQuestion(currentQuestion.id, optionIndex)
  }

  const handleCheck = () => {
    if (!hasAnswered) return
    checkAnswer()
  }

  const handleNext = () => {
    if (isLastQuestion) {
      return
    }
    nextQuestion()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Área de scroll para la pregunta */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Enunciado de la pregunta */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Pregunta {currentQuestionIndex + 1} de {caseQuestions.length}
              </span>
              {currentQuestion.points && (
                <span className="text-xs text-gray-400">
                  · {currentQuestion.points} pt{currentQuestion.points !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <HTMLContent
              html={currentQuestion.statement}
              className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed"
            />
          </div>

          {/* Opciones de respuesta */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOptionIndex === index
              const isCorrectOption = hasChecked && index === currentQuestion.correct_option_index
              const isWrongSelection = hasChecked && isSelected && !isCorrect

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(index)}
                  disabled={hasChecked}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                    'hover:border-primary/50 hover:bg-primary/5',
                    isSelected && !hasChecked && 'border-primary bg-primary/10',
                    isCorrectOption && 'border-green-500 bg-green-50',
                    isWrongSelection && 'border-red-500 bg-red-50',
                    !isSelected && !hasChecked && 'border-gray-200 bg-white',
                    hasChecked && !isCorrectOption && !isWrongSelection && 'opacity-60',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCorrectOption ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : isWrongSelection ? (
                        <CheckCircle2 className="h-5 w-5 text-red-600" />
                      ) : (
                        <Circle className={cn(
                          'h-5 w-5',
                          isSelected ? 'text-primary fill-primary/20' : 'text-gray-300'
                        )} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-sm sm:text-base',
                        isCorrectOption ? 'text-green-800 font-medium' :
                        isWrongSelection ? 'text-red-800 font-medium' :
                        'text-gray-700'
                      )}>
                        <span className="font-semibold mr-1">{option.label})</span>
                        <HTMLContent html={option.text} as="span" className="inline" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {hasChecked && feedbackState.status !== 'idle' && (
            <FeedbackCard />
          )}
        </div>
      </div>

      {/* Barra de acciones inferior */}
      <div className="border-t bg-white px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                navigateToQuestion(currentCaseIndex, currentQuestionIndex - 1)
              } else if (currentCaseIndex > 0) {
                const prevCaseIndex = currentCaseIndex - 1
                const prevCaseQuestions = questions[cases[prevCaseIndex].id]
                if (prevCaseQuestions) {
                  navigateToQuestion(prevCaseIndex, prevCaseQuestions.length - 1)
                }
              }
            }}
            disabled={currentCaseIndex === 0 && currentQuestionIndex === 0}
            className="gap-2 text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {!hasChecked && (
              <Button
                onClick={handleCheck}
                disabled={!hasAnswered}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                Verificar
              </Button>
            )}

            {hasChecked && !isLastQuestion && (
              <Button
                onClick={handleNext}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

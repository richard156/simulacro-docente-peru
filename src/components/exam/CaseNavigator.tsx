import { useExamStore } from '@/stores/examStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

interface CaseNavigatorProps {
  isOpen: boolean
  onClose: () => void
}

export function CaseNavigator({ isOpen, onClose }: CaseNavigatorProps) {
  const {
    cases, questions, currentCaseIndex, currentQuestionIndex,
    answers, navigateToQuestion, navigateToCase,
  } = useExamStore()

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel del navigator */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transition-transform duration-300',
        'lg:static lg:shadow-none lg:border-l lg:w-72',
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Encabezado */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-900">Navegación</h3>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {cases.map((examCase, caseIndex) => {
                const caseQuestions = questions[examCase.id]
                if (!caseQuestions) return null

                const isCurrentCase = caseIndex === currentCaseIndex
                const answeredInCase = caseQuestions.filter(q => {
                  const answer = answers[q.id]
                  return answer?.selectedOptionIndex !== null && answer?.selectedOptionIndex !== undefined
                }).length

                return (
                  <div key={examCase.id}>
                    {/* Encabezado del caso */}
                    <button
                      onClick={() => {
                        navigateToCase(caseIndex)
                        onClose()
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors',
                        isCurrentCase
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Caso {examCase.case_number}
                        </span>
                        <span className="text-xs text-gray-400">
                          {answeredInCase}/{caseQuestions.length}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {examCase.title ?? `Caso ${examCase.case_number}`}
                      </p>
                    </button>

                    {/* Preguntas del caso */}
                    <div className="mt-1 ml-2 space-y-0.5">
                      {caseQuestions.map((question, qIndex) => {
                        const answer = answers[question.id]
                        const isCurrentQuestion = isCurrentCase && qIndex === currentQuestionIndex
                        const isAnswered = answer?.selectedOptionIndex !== null && answer?.selectedOptionIndex !== undefined
                        const isCorrect = answer?.isCorrect === true
                        const isIncorrect = answer?.isCorrect === false

                        return (
                          <button
                            key={question.id}
                            onClick={() => {
                              navigateToQuestion(caseIndex, qIndex)
                              onClose()
                            }}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
                              isCurrentQuestion && 'bg-primary/10 text-primary font-medium',
                              !isCurrentQuestion && 'hover:bg-gray-50 text-gray-600'
                            )}
                          >
                            {/* Indicador de estado */}
                            <span className="shrink-0">
                              {isCorrect ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              ) : isIncorrect ? (
                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                              ) : isAnswered ? (
                                <Circle className="h-3.5 w-3.5 text-gray-400" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-gray-300" />
                              )}
                            </span>

                            {/* Número de pregunta */}
                            <span className={cn(
                              'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium',
                              isCurrentQuestion
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-500'
                            )}>
                              {qIndex + 1}
                            </span>

                            {/* Tipo de pregunta - oculto por ahora */}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Resumen rápido */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Correctas</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Incorrectas</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-gray-300" />
                <span>Sin responder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import { useExamStore } from '@/stores/examStore'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeedbackCard() {
  const { feedbackState, cases, currentCaseIndex, questions, currentQuestionIndex } = useExamStore()
  const { status, selectedOptionIndex, correctOptionIndex, explanation, pedagogicalReference } = feedbackState

  if (status === 'idle') return null

  const currentCase = cases[currentCaseIndex]
  const caseQuestions = currentCase ? questions[currentCase.id] : []
  const currentQuestion = caseQuestions ? caseQuestions[currentQuestionIndex] : null
  const correctOption = correctOptionIndex !== null ? currentQuestion?.options[correctOptionIndex] : null
  const selectedOption = selectedOptionIndex !== null ? currentQuestion?.options[selectedOptionIndex] : null

  const isCorrect = status === 'correct'

  return (
    <Card className={cn(
      'p-4 border-2 transition-all duration-300',
      isCorrect
        ? 'border-green-300 bg-green-50'
        : 'border-red-300 bg-red-50'
    )}>
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        )}>
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-semibold text-sm',
            isCorrect ? 'text-green-800' : 'text-red-800'
          )}>
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </h4>

          {!isCorrect && selectedOption && correctOption && (
            <p className="mt-1 text-xs text-red-700">
              Tu respuesta: <span className="font-medium">{selectedOption.label}) {selectedOption.text}</span>
            </p>
          )}

          {!isCorrect && correctOption && (
            <p className="mt-0.5 text-xs text-green-700">
              Respuesta correcta: <span className="font-medium">{correctOption.label}) {correctOption.text}</span>
            </p>
          )}
        </div>
      </div>

      {/* Explicación */}
      <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-700 leading-relaxed">{explanation}</p>
        </div>
      </div>

      {/* Referencia pedagógica */}
      {pedagogicalReference && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
            {pedagogicalReference}
          </Badge>
        </div>
      )}
    </Card>
  )
}

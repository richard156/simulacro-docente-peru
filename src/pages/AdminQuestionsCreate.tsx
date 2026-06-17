import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createQuestion, updateQuestion as updateQuestionService, fetchCaseQuestionsAdmin } from '@/lib/adminService'
import type { CaseQuestion } from '@/types'

interface QuestionForm {
  id?: string // ID de la pregunta existente (para edición)
  question_number: number
  statement: string
  options: { id: string; label: string; text: string }[]
  correct_answer: string
  explanation: string
}

export function AdminQuestionsCreate() {
  const navigate = useNavigate()
  const { examId, caseId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questions, setQuestions] = useState<QuestionForm[]>([])
  const [existingCount, setExistingCount] = useState(0)

  useEffect(() => {
    const loadQuestions = async () => {
      if (!caseId) return
      try {
        const existing = await fetchCaseQuestionsAdmin(caseId)
        setExistingCount(existing.length)

        // Si hay preguntas existentes, cargarlas
        // Nota: fetchCaseQuestionsAdmin ya normaliza las opciones a QuestionOption[]
        if (existing.length > 0) {
          setQuestions(
            existing.map((q) => ({
              id: q.id,
              question_number: q.question_number,
              statement: q.statement,
              options: q.options as { id: string; label: string; text: string }[],
              correct_answer: String.fromCharCode(65 + q.correct_option_index),
              explanation: q.explanation,
            }))
          )
        } else {
          // Iniciar con una pregunta vacía
          setQuestions([
            {
              question_number: 1,
              statement: '',
              options: [
                { id: 'a', label: 'A', text: '' },
                { id: 'b', label: 'B', text: '' },
                { id: 'c', label: 'C', text: '' },
                { id: 'd', label: 'D', text: '' },
              ],
              correct_answer: '',
              explanation: '',
            },
          ])
        }
      } catch (err) {
        toast.error('Error al cargar preguntas existentes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [caseId])

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_number: prev.length + 1 + existingCount,
        statement: '',
        options: [
          { id: 'a', label: 'A', text: '' },
          { id: 'b', label: 'B', text: '' },
          { id: 'c', label: 'C', text: '' },
          { id: 'd', label: 'D', text: '' },
        ],
        correct_answer: '',
        explanation: '',
      },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Debe haber al menos una pregunta')
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: string | number
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    )
  }

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optionIndex ? { ...opt, text: value } : opt
              ),
            }
          : q
      )
    )
  }

  const validate = (): boolean => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.statement.trim()) {
        toast.error(`La pregunta ${q.question_number} no tiene enunciado`)
        return false
      }
      if (q.options.some((o) => !o.text.trim())) {
        toast.error(`La pregunta ${q.question_number} tiene opciones vacías`)
        return false
      }
      if (!q.correct_answer) {
        toast.error(`La pregunta ${q.question_number} no tiene respuesta correcta`)
        return false
      }
      if (!q.explanation.trim()) {
        toast.error(`La pregunta ${q.question_number} no tiene explicación`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit ejecutado!')
    e.preventDefault()
    console.log('Validando...')
    if (!validate()) {
      console.log('Validación falló')
      return
    }
    console.log('Validación OK')
    if (!caseId) {
      toast.error('No se ha especificado un caso')
      return
    }

    setSaving(true)
    console.log('Guardando preguntas...', { questions, caseId, examId })
    try {
      for (const question of questions) {
        console.log('Procesando pregunta:', question)

        if (question.id) {
          // Actualizar pregunta existente
          console.log('Actualizando pregunta existente:', question.id)
          await updateQuestionService(question.id, {
            question_number: question.question_number,
            statement: question.statement.trim(),
            options: question.options,
            correct_answer: question.correct_answer,
            explanation: question.explanation.trim(),
          })
        } else {
          // Crear nueva pregunta
          console.log('Creando nueva pregunta')
          await createQuestion({
            case_id: caseId,
            question_number: question.question_number,
            statement: question.statement.trim(),
            options: question.options,
            correct_answer: question.correct_answer,
            explanation: question.explanation.trim(),
          })
        }
      }

      toast.success(`${questions.length} pregunta(s) guardada(s) correctamente`)
      navigate(`/admin/exam/${examId}/cases`)
    } catch (err) {
      console.error('Error detallado al guardar:', err)
      toast.error(`Error: ${err instanceof Error ? err.message : 'Error al guardar las preguntas'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/exam/${examId}/cases`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {existingCount > 0 ? 'Editar Preguntas' : 'Crear Preguntas'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {existingCount > 0
                ? `Editando ${existingCount} pregunta(s) existente(s)`
                : 'Agrega preguntas al caso clínico'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Pregunta
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Pregunta #{question.question_number}
                </CardTitle>
              </div>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enunciado */}
              <div className="space-y-2">
                <Label htmlFor={`statement-${index}`}>Enunciado</Label>
                <textarea
                  id={`statement-${index}`}
                  placeholder="Escribe el enunciado de la pregunta..."
                  value={question.statement}
                  onChange={(e) =>
                    updateQuestion(index, 'statement', e.target.value)
                  }
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                <Label>Opciones de respuesta</Label>
                {question.options.map((option, oi) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        value={option.label}
                        checked={question.correct_answer === option.label}
                        onChange={(e) =>
                          updateQuestion(index, 'correct_answer', e.target.value)
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm font-medium text-gray-600 w-5">
                        {option.label})
                      </span>
                    </div>
                    <Input
                      placeholder={`Opción ${option.label}`}
                      value={option.text}
                      onChange={(e) => updateOption(index, oi, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  Selecciona el radio button de la opción correcta.
                </p>
              </div>

              {/* Explicación */}
              <div className="space-y-2">
                <Label htmlFor={`explanation-${index}`}>Explicación</Label>
                <textarea
                  id={`explanation-${index}`}
                  placeholder="Explica por qué esta es la respuesta correcta..."
                  value={question.explanation}
                  onChange={(e) =>
                    updateQuestion(index, 'explanation', e.target.value)
                  }
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/exam/${examId}/cases`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {existingCount > 0
                  ? 'Actualizar Preguntas'
                  : `Guardar ${questions.length} Pregunta(s)`}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { createQuestion, fetchCaseQuestionsAdmin } from '@/lib/adminService'
import type { CaseQuestion } from '@/types'

interface QuestionForm {
  question_number: number
  statement: string
  options: { id: string; label: string; text: string }[]
  correct_option_index: number
  explanation: string
  pedagogical_reference: string
}

const LABELS = ['A', 'B', 'C', 'D']

function createEmptyQuestion(number: number): QuestionForm {
  return {
    question_number: number,
    statement: '',
    options: LABELS.map((label) => ({
      id: `opt_${number}_${label}`,
      label,
      text: '',
    })),
    correct_option_index: 0,
    explanation: '',
    pedagogical_reference: '',
  }
}

export function AdminQuestionsCreate() {
  const navigate = useNavigate()
  const { caseId, examId } = useParams()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<QuestionForm[]>([createEmptyQuestion(1)])
  const [existingCount, setExistingCount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadExisting = async () => {
      if (!caseId) return
      try {
        const existing = await fetchCaseQuestionsAdmin(caseId)
        setExistingCount(existing.length)
        if (existing.length > 0) {
          setQuestions(
            existing.map((q, i) => ({
              question_number: i + 1,
              statement: q.statement,
              options: q.options as { id: string; label: string; text: string }[],
              correct_option_index: q.correct_option_index,
              explanation: q.explanation,
              pedagogical_reference: q.pedagogical_reference ?? '',
            }))
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadExisting()
  }, [caseId])

  const addQuestion = () => {
    if (questions.length >= 6) {
      toast.error('Máximo 6 preguntas por caso')
      return
    }
    setQuestions(prev => [
      ...prev,
      createEmptyQuestion(prev.length + 1),
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Debe haber al menos una pregunta')
      return
    }
    setQuestions(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Renumerar
      return updated.map((q, i) => ({ ...q, question_number: i + 1 }))
    })
  }

  const updateQuestion = (index: number, field: string, value: string | number) => {
    setQuestions(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    // Limpiar error
    const errorKey = `q${index}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => {
      const updated = [...prev]
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: updated[questionIndex].options.map((opt, i) =>
          i === optionIndex ? { ...opt, text: value } : opt
        ),
      }
      return updated
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    questions.forEach((q, index) => {
      if (!q.statement.trim()) {
        newErrors[`q${index}_statement`] = 'El enunciado es obligatorio'
      }
      q.options.forEach((opt, optIndex) => {
        if (!opt.text.trim()) {
          newErrors[`q${index}_opt${optIndex}`] = `Opción ${opt.label} es obligatoria`
        }
      })
      if (!q.explanation.trim()) {
        newErrors[`q${index}_explanation`] = 'La explicación es obligatoria'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Corrige los errores antes de guardar')
      return
    }

    if (!caseId) {
      toast.error('No se ha especificado un caso')
      return
    }

    setSaving(true)
    try {
      // Crear cada pregunta
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await createQuestion({
          case_id: caseId,
          question_number: existingCount + i + 1,
          statement: q.statement.trim(),
          options: q.options.map(opt => ({
            id: opt.id,
            label: opt.label,
            text: opt.text.trim(),
          })),
          correct_option_index: q.correct_option_index,
          explanation: q.explanation.trim(),
          pedagogical_reference: q.pedagogical_reference.trim() || null,
        })
      }

      toast.success(`${questions.length} pregunta(s) guardada(s) correctamente`)
      navigate(`/admin/exam/${examId}/cases`)
    } catch (err) {
      toast.error('Error al guardar las preguntas')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando preguntas existentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Preguntas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {existingCount > 0
              ? `Editando ${existingCount} pregunta(s) existente(s)`
              : `Creando preguntas para el caso (máximo 6)`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {question.question_number}
                    </span>
                    <CardTitle className="text-base">
                      Pregunta {existingCount + qIndex + 1}
                    </CardTitle>
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enunciado */}
                <div className="space-y-2">
                  <Label>
                    Enunciado <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    placeholder="Escribe el enunciado de la pregunta..."
                    value={question.statement}
                    onChange={(e) => updateQuestion(qIndex, 'statement', e.target.value)}
                    rows={3}
                    className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors[`q${qIndex}_statement`] ? 'border-red-500' : ''
                    }`}
                  />
                  {errors[`q${qIndex}_statement`] && (
                    <p className="text-xs text-red-500">{errors[`q${qIndex}_statement`]}</p>
                  )}
                </div>

                {/* Opciones */}
                <div className="space-y-3">
                  <Label>
                    Opciones <span className="text-red-500">*</span>
                  </Label>
                  {question.options.map((option, optIndex) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct_${qIndex}`}
                        checked={question.correct_option_index === optIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_option_index', optIndex)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        title={`Marcar opción ${option.label} como correcta`}
                      />
                      <span className="text-sm font-medium text-gray-500 w-5">
                        {option.label}
                      </span>
                      <div className="flex-1">
                        <Input
                          placeholder={`Texto de la opción ${option.label}...`}
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          className={errors[`q${qIndex}_opt${optIndex}`] ? 'border-red-500' : ''}
                        />
                      </div>
                      {errors[`q${qIndex}_opt${optIndex}`] && (
                        <p className="text-xs text-red-500">{errors[`q${qIndex}_opt${optIndex}`]}</p>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-gray-400">
                    Selecciona el radio button de la opción correcta.
                  </p>
                </div>

                {/* Explicación */}
                <div className="space-y-2">
                  <Label>
                    Explicación <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    placeholder="Explica por qué esta es la respuesta correcta..."
                    value={question.explanation}
                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    rows={3}
                    className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors[`q${qIndex}_explanation`] ? 'border-red-500' : ''
                    }`}
                  />
                  {errors[`q${qIndex}_explanation`] && (
                    <p className="text-xs text-red-500">{errors[`q${qIndex}_explanation`]}</p>
                  )}
                </div>

                {/* Referencia pedagógica */}
                <div className="space-y-2">
                  <Label>Referencia pedagógica</Label>
                  <Input
                    placeholder="Ej: Minedu (2016). Currículo Nacional de la Educación Básica."
                    value={question.pedagogical_reference}
                    onChange={(e) => updateQuestion(qIndex, 'pedagogical_reference', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agregar otra pregunta */}
        {questions.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="w-full mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar otra pregunta ({questions.length}/6)
          </Button>
        )}

        <div className="flex justify-end gap-3 mt-6">
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
                Guardar {questions.length} pregunta(s)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

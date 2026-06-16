import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { fetchExamCasesAdmin, createCase, fetchAllExams } from '@/lib/adminService'
import type { Exam, ExamCase } from '@/types'

export function AdminCaseCreate() {
  const navigate = useNavigate()
  const { examId } = useParams()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState<Exam | null>(null)
  const [existingCases, setExistingCases] = useState<ExamCase[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    case_number: 1,
    title: '',
    subject_area: '',
    context_text: '',
    key_points: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allExams, cases] = await Promise.all([
          fetchAllExams(),
          examId ? fetchExamCasesAdmin(examId) : Promise.resolve([]),
        ])

        const foundExam = allExams.find(e => e.id === examId)
        if (foundExam) {
          setExam(foundExam)
          setFormData(prev => ({
            ...prev,
            case_number: cases.length + 1,
          }))
        }
        setExistingCases(cases)
      } catch (err) {
        toast.error('Error al cargar datos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [examId])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.subject_area.trim()) {
      newErrors.subject_area = 'El área temática es obligatoria'
    }
    if (!formData.context_text.trim()) {
      newErrors.context_text = 'El texto del caso es obligatorio'
    }
    if (formData.context_text.trim().length < 50) {
      newErrors.context_text = 'El texto debe tener al menos 50 caracteres'
    }

    // Validar JSON de key_points si se ingresó
    if (formData.key_points.trim()) {
      try {
        JSON.parse(formData.key_points)
      } catch {
        newErrors.key_points = 'Debe ser un JSON válido (ej: ["punto1", "punto2"])'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return
    if (!examId) {
      toast.error('No se ha especificado un examen')
      return
    }

    setSaving(true)
    try {
      let keyPoints = null
      if (formData.key_points.trim()) {
        keyPoints = JSON.parse(formData.key_points)
      }

      const newCase = await createCase({
        exam_id: examId,
        case_number: formData.case_number,
        title: formData.title.trim() || null,
        subject_area: formData.subject_area.trim(),
        context_text: formData.context_text.trim(),
        key_points: keyPoints,
      })

      if (newCase) {
        toast.success('Caso creado correctamente')
        navigate(`/admin/exam/${examId}/cases/${newCase.id}/questions`)
      } else {
        toast.error('No se pudo crear el caso')
      }
    } catch (err) {
      toast.error('Error al crear el caso')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
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

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Examen no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/admin')} className="mt-4">
          Volver al dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Caso</h1>
          <p className="text-sm text-gray-500 mt-1">
            Examen: <span className="font-medium text-gray-700">{exam.title}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Caso</CardTitle>
            <CardDescription>
              Caso #{formData.case_number} de {exam.title}.
              {existingCases.length > 0 && (
                <span className="block mt-1 text-xs">
                  Casos existentes: {existingCases.length}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Número de caso */}
            <div className="space-y-2">
              <Label htmlFor="case_number">Número de caso</Label>
              <Input
                id="case_number"
                type="number"
                min={1}
                value={formData.case_number}
                onChange={(e) => handleChange('case_number', parseInt(e.target.value) || 1)}
              />
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título del caso</Label>
              <Input
                id="title"
                placeholder="Ej: Caso sobre planificación curricular"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            {/* Área temática */}
            <div className="space-y-2">
              <Label htmlFor="subject_area">
                Área temática <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject_area"
                placeholder="Ej: Currículo Nacional"
                value={formData.subject_area}
                onChange={(e) => handleChange('subject_area', e.target.value)}
                className={errors.subject_area ? 'border-red-500' : ''}
              />
              {errors.subject_area && (
                <p className="text-xs text-red-500">{errors.subject_area}</p>
              )}
            </div>

            {/* Texto del caso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="context_text">
                  Texto del caso <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-1.5 text-xs"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Vista previa
                    </>
                  )}
                </Button>
              </div>

              {showPreview ? (
                <div className="min-h-[300px] p-4 rounded-md border bg-gray-50 text-sm whitespace-pre-wrap">
                  {formData.context_text || (
                    <span className="text-gray-400">Sin contenido para previsualizar</span>
                  )}
                </div>
              ) : (
                <textarea
                  id="context_text"
                  placeholder="Escribe aquí el texto del caso pedagógico..."
                  value={formData.context_text}
                  onChange={(e) => handleChange('context_text', e.target.value)}
                  rows={15}
                  className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.context_text ? 'border-red-500' : ''
                  }`}
                />
              )}
              {errors.context_text && (
                <p className="text-xs text-red-500">{errors.context_text}</p>
              )}
              <p className="text-xs text-gray-400">
                {formData.context_text.length} caracteres
              </p>
            </div>

            {/* Puntos clave */}
            <div className="space-y-2">
              <Label htmlFor="key_points">Puntos clave (JSON array)</Label>
              <textarea
                id="key_points"
                placeholder='["Punto clave 1", "Punto clave 2", "Punto clave 3"]'
                value={formData.key_points}
                onChange={(e) => handleChange('key_points', e.target.value)}
                rows={3}
                className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono ${
                  errors.key_points ? 'border-red-500' : ''
                }`}
              />
              {errors.key_points && (
                <p className="text-xs text-red-500">{errors.key_points}</p>
              )}
              <p className="text-xs text-gray-400">
                Ingresa un array JSON con los puntos clave del caso.
              </p>
            </div>
          </CardContent>
        </Card>

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
                Crear Caso
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

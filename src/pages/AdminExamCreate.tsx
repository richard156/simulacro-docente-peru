import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save, Globe, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { createExam, updateExam, fetchExamById } from '@/lib/adminService'

const EXAM_TYPES = [
  { value: 'nombramiento', label: 'Nombramiento' },
  { value: 'ascenso', label: 'Ascenso' },
  { value: 'desempeno', label: 'Desempeño' },
]

export function AdminExamCreate() {
  const navigate = useNavigate()
  const { examId } = useParams()
  const isEditing = !!examId
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'nombramiento' as 'nombramiento' | 'ascenso' | 'desempeno',
    specialty: '',
    duration_minutes: 120,
    passing_score: 60,
    is_published: false,
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (!examId) return

    const loadExam = async () => {
      try {
        const exam = await fetchExamById(examId)
        if (exam) {
          setFormData({
            title: exam.title || '',
            description: exam.description || '',
            type: exam.type || 'nombramiento',
            specialty: exam.specialty || '',
            duration_minutes: exam.duration_minutes || 120,
            passing_score: exam.passing_score || 60,
            is_published: exam.is_published ?? false,
            is_active: exam.is_active ?? true,
          })
        }
      } catch (err) {
        toast.error('Error al cargar el examen')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadExam()
  }, [examId])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }
    if (!formData.duration_minutes || formData.duration_minutes < 1) {
      newErrors.duration_minutes = 'La duración debe ser mayor a 0'
    }
    if (!formData.passing_score || formData.passing_score < 1 || formData.passing_score > 100) {
      newErrors.passing_score = 'El puntaje debe estar entre 1 y 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSaving(true)
    try {
      if (isEditing && examId) {
        // Actualizar examen existente
        await updateExam(examId, {
          title: formData.title.trim(),
          description: formData.description.trim() || '',
          type: formData.type,
          specialty: formData.specialty.trim() || '',
          duration_minutes: formData.duration_minutes,
          passing_score: formData.passing_score,
          is_published: formData.is_published,
          is_active: formData.is_active,
        })
        toast.success('Examen actualizado correctamente')
        navigate('/admin')
      } else {
        // Crear nuevo examen
        const exam = await createExam({
          title: formData.title.trim(),
          description: formData.description.trim() || '',
          type: formData.type,
          specialty: formData.specialty.trim() || '',
          duration_minutes: formData.duration_minutes,
          passing_score: formData.passing_score,
          is_published: false,
          is_active: true,
        })

        if (exam) {
          toast.success('Examen creado correctamente')
          navigate(`/admin/exam/${exam.id}/cases`)
        } else {
          toast.error('No se pudo crear el examen')
        }
      }
    } catch (err) {
      toast.error(isEditing ? 'Error al actualizar el examen' : 'Error al crear el examen')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo
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
          <p className="text-gray-500 text-sm">Cargando examen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Examen' : 'Crear Nuevo Examen'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? 'Modifica los datos del examen y gestiona su estado de publicación.'
              : 'Completa los datos para crear un nuevo examen de simulacro.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Examen</CardTitle>
            <CardDescription>
              Define los detalles básicos del examen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Concurso de Nombramiento 2024"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                placeholder="Describe el propósito del examen..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                placeholder="Ej: Educación Primaria"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
              />
            </div>

            {/* Duración y Puntaje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">
                  Duración (minutos) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min={1}
                  max={480}
                  value={formData.duration_minutes}
                  onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
                  className={errors.duration_minutes ? 'border-red-500' : ''}
                />
                {errors.duration_minutes && (
                  <p className="text-xs text-red-500">{errors.duration_minutes}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing_score">
                  Puntaje aprobatorio (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="passing_score"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.passing_score}
                  onChange={(e) => handleChange('passing_score', parseInt(e.target.value) || 0)}
                  className={errors.passing_score ? 'border-red-500' : ''}
                />
                {errors.passing_score && (
                  <p className="text-xs text-red-500">{errors.passing_score}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Estado del Examen</CardTitle>
              <CardDescription>
                Controla la visibilidad y disponibilidad del examen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Publicado / Borrador */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.is_published ? (
                    <Globe className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.is_published ? 'Publicado' : 'Borrador'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.is_published
                        ? 'El examen es visible para los usuarios en /exams'
                        : 'Solo visible en el panel de administración'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={formData.is_published ? 'outline' : 'default'}
                  size="sm"
                  onClick={() =>
                    handleChange('is_published', !formData.is_published)
                  }
                >
                  {formData.is_published ? 'Despublicar' : 'Publicar'}
                </Button>
              </div>

              {/* Activo / Inactivo */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.is_active ? 'Activo' : 'Inactivo'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.is_active
                      ? 'Los usuarios pueden rendir el examen'
                      : 'El examen está deshabilitado temporalmente'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={formData.is_active ? 'outline' : 'default'}
                  size="sm"
                  onClick={() =>
                    handleChange('is_active', !formData.is_active)
                  }
                >
                  {formData.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>

              {/* Enlace a documentos */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/pdf/upload?examId=${examId}`)}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Ver Documentos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin')}
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
                {isEditing ? 'Guardar Cambios' : 'Crear Examen'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

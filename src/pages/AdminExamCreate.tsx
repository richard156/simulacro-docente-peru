import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createExam } from '@/lib/adminService'

const EXAM_TYPES = [
  { value: 'nombramiento', label: 'Nombramiento' },
  { value: 'ascenso', label: 'Ascenso' },
  { value: 'desempeno', label: 'Desempeño' },
]

export function AdminExamCreate() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'nombramiento' as 'nombramiento' | 'ascenso' | 'desempeno',
    specialty: '',
    duration_minutes: 120,
    passing_score: 60,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      const exam = await createExam({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        specialty: formData.specialty.trim() || null,
        duration_minutes: formData.duration_minutes,
        passing_score: formData.passing_score,
      })

      if (exam) {
        toast.success('Examen creado correctamente')
        navigate(`/admin/exam/${exam.id}/cases`)
      } else {
        toast.error('No se pudo crear el examen')
      }
    } catch (err) {
      toast.error('Error al crear el examen')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Examen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Completa los datos para crear un nuevo examen de simulacro.
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
                Crear Examen
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

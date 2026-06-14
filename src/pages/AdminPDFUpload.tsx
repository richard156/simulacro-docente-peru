import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react'
import { toast } from 'sonner'
import { uploadPDF, fetchAllExams } from '@/lib/adminService'
import type { Exam } from '@/types'

export function AdminPDFUpload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exam_id: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await fetchAllExams()
        setExams(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadExams()
  }, [])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }
    if (!selectedFile) {
      newErrors.file = 'Debes seleccionar un archivo PDF'
    } else if (selectedFile.type !== 'application/pdf') {
      newErrors.file = 'El archivo debe ser un PDF'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF')
        return
      }
      setSelectedFile(file)
      if (!formData.title.trim()) {
        // Auto-completar título con nombre del archivo
        setFormData(prev => ({
          ...prev,
          title: file.name.replace('.pdf', ''),
        }))
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return
    if (!selectedFile) return

    setUploading(true)
    try {
      const result = await uploadPDF(selectedFile, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        exam_id: formData.exam_id || null,
      })

      if (result) {
        toast.success('PDF subido correctamente')

        // Simular procesamiento
        setProcessing(true)
        setTimeout(() => {
          setProcessing(false)
          toast.success('PDF procesado correctamente')
          navigate('/admin')
        }, 3000)
      }
    } catch (err) {
      toast.error('Error al subir el PDF')
      console.error(err)
      setUploading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-2xl font-bold text-gray-900">Subir PDF</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sube documentos pedagógicos en formato PDF para procesar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Documento</CardTitle>
            <CardDescription>
              Selecciona un archivo PDF y completa los metadatos.
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
                placeholder="Ej: RVM N° 000-2024-MINEDU"
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
                placeholder="Describe el contenido del documento..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Examen asociado */}
            <div className="space-y-2">
              <Label htmlFor="exam_id">Examen asociado (opcional)</Label>
              <select
                id="exam_id"
                value={formData.exam_id}
                onChange={(e) => handleChange('exam_id', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sin examen asociado</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Archivo */}
            <div className="space-y-2">
              <Label>
                Archivo PDF <span className="text-red-500">*</span>
              </Label>

              {selectedFile ? (
                <div className="flex items-center justify-between p-3 rounded-md border bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-600">
                    Haz clic para seleccionar un PDF
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    o arrastra y suelta el archivo aquí
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.file && (
                <p className="text-xs text-red-500">{errors.file}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Procesando */}
        {processing && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Procesando PDF...
                </p>
                <p className="text-xs text-yellow-600">
                  El documento está siendo procesado. Esto puede tomar unos momentos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin')}
            disabled={uploading || processing}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={uploading || processing || !selectedFile}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir PDF
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

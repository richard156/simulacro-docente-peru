import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileText, ArrowLeft, X } from 'lucide-react'
import { toast } from 'sonner'
import { uploadPDF, fetchAllExams } from '@/lib/adminService'
import type { Exam } from '@/types'

export function AdminPDFUpload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await fetchAllExams()
        setExams(data)
      } catch (err) {
        toast.error('Error al cargar exámenes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadExams()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.includes('pdf')) {
        toast.error('Solo se permiten archivos PDF')
        return
      }
      setFile(selectedFile)
      setProgress(0)
    }
  }

  const handleUpload = async () => {
    if (!selectedExamId) {
      toast.error('Selecciona un examen')
      return
    }
    if (!file) {
      toast.error('Selecciona un archivo PDF')
      return
    }

    setUploading(true)
    try {
      await uploadPDF(file, selectedExamId, (p) => setProgress(p))
      toast.success('PDF subido correctamente')
      setFile(null)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir el PDF')
      console.error(err)
    } finally {
      setUploading(false)
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
            Sube documentos PDF de referencia para los exámenes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seleccionar archivo</CardTitle>
          <CardDescription>
            Elige un examen y sube un documento PDF relacionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Seleccionar examen */}
          <div className="space-y-2">
            <Label htmlFor="exam">Examen</Label>
            <select
              id="exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar examen...</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          {/* Seleccionar archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo PDF</Label>
            <div className="flex items-center gap-3">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="flex-1"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-gray-400">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  onClick={() => {
                    setFile(null)
                    setProgress(0)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subiendo...</span>
                <span className="text-gray-700 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botón de subida */}
          <Button
            onClick={handleUpload}
            disabled={!selectedExamId || !file || uploading}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

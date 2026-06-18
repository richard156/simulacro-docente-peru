import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HTMLContent } from '@/components/ui/html-content'
import { Loader2, ArrowLeft, Plus, Trash2, FileQuestion, BookOpen, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAllExams, fetchExamCasesAdmin, deleteCase } from '@/lib/adminService'
import type { Exam, ExamCase } from '@/types'

export function AdminExamCases() {
  const navigate = useNavigate()
  const { examId } = useParams()
  const [exam, setExam] = useState<Exam | null>(null)
  const [cases, setCases] = useState<ExamCase[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!examId) return
      try {
        const [allExams, examCases] = await Promise.all([
          fetchAllExams(),
          fetchExamCasesAdmin(examId),
        ])

        const foundExam = allExams.find((e) => e.id === examId)
        if (foundExam) {
          setExam(foundExam)
        }
        setCases(examCases)
      } catch (err) {
        toast.error('Error al cargar datos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [examId])

  const handleDelete = async (caseItem: ExamCase) => {
    if (!window.confirm(`¿Estás seguro de eliminar el caso #${caseItem.case_number}?`)) {
      return
    }

    setDeletingId(caseItem.id)
    try {
      await deleteCase(caseItem.id)
      toast.success('Caso eliminado correctamente')
      setCases((prev) => prev.filter((c) => c.id !== caseItem.id))
    } catch (err) {
      toast.error('Error al eliminar el caso')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando casos...</p>
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <h1 className="text-2xl font-bold text-gray-900">Casos del Examen</h1>
            <p className="text-sm text-gray-500 mt-1">
              {exam.title} - {cases.length} caso(s)
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/admin/exam/${examId}/case/create`)}
          className="gap-2 bg-primary hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo Caso
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No hay casos creados para este examen.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/exam/${examId}/case/create`)}
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear primer caso
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className={`hover:shadow-md transition-shadow ${
                deletingId === caseItem.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Caso #{caseItem.case_number}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {caseItem.subject_area}
                      </Badge>
                    </div>
                    {caseItem.title && (
                      <h3 className="font-semibold text-gray-900">
                        {caseItem.title}
                      </h3>
                    )}
                    <HTMLContent
                      html={caseItem.context_text}
                      className="text-sm text-gray-500 line-clamp-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/exam/${examId}/cases/${caseItem.id}/questions`
                        )
                      }
                      className="gap-1.5"
                    >
                      <FileQuestion className="h-4 w-4" />
                      Preguntas
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/exam/${examId}/cases/${caseItem.id}/edit`
                        )
                      }
                      className="gap-1.5"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(caseItem)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

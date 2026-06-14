import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Plus, Eye, Trash2, FileQuestion, BookOpen, Pencil } from 'lucide-react'
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

  const loadData = async () => {
    if (!examId) return
    try {
      const [allExams, examCases] = await Promise.all([
        fetchAllExams(),
        fetchExamCasesAdmin(examId),
      ])
      const foundExam = allExams.find(e => e.id === examId)
      setExam(foundExam ?? null)
      setCases(examCases)
    } catch (err) {
      toast.error('Error al cargar datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [examId])

  const handleDeleteCase = async (caseItem: ExamCase) => {
    if (!window.confirm(`¿Estás seguro de eliminar el caso #${caseItem.case_number}?`)) {
      return
    }

    if (!examId) return

    setDeletingId(caseItem.id)
    try {
      await deleteCase(caseItem.id, examId)
      toast.success('Caso eliminado correctamente')
      await loadData()
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
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los casos y preguntas de este examen.
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/admin/exam/${examId}/case/create`)}
          className="gap-2 bg-primary hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo caso
        </Button>
      </div>

      {/* Exam info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {exam.type === 'nombramiento' ? 'Nombramiento' : exam.type === 'ascenso' ? 'Ascenso' : 'Desempeño'}
        </Badge>
        {exam.specialty && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {exam.specialty}
          </span>
        )}
        <span>{exam.total_cases} casos</span>
        <span>{exam.total_questions} preguntas</span>
        <span>{exam.duration_minutes} min</span>
        <Badge variant={exam.is_published ? 'default' : 'secondary'}>
          {exam.is_published ? 'Publicado' : 'Borrador'}
        </Badge>
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Este examen aún no tiene casos.
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
        <div className="space-y-3">
          {cases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className={`hover:shadow-md transition-shadow ${
                deletingId === caseItem.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {caseItem.case_number}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {caseItem.title || `Caso ${caseItem.case_number}`}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Área: {caseItem.subject_area}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {caseItem.context_text?.substring(0, 200)}
                      {caseItem.context_text?.length > 200 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/exam/${examId}/cases/${caseItem.id}/edit`)}
                      className="gap-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/exam/${examId}/cases/${caseItem.id}/questions`)}
                      className="gap-1.5 text-xs"
                    >
                      <FileQuestion className="h-3.5 w-3.5" />
                      Preguntas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCase(caseItem)}
                      className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
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

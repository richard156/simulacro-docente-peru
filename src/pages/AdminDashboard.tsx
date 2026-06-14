import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Search, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { fetchAllExams, deleteExam } from '@/lib/adminService'
import { ExamCard } from '@/components/admin/ExamCard'
import type { Exam } from '@/types'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadExams = useCallback(async () => {
    try {
      const data = await fetchAllExams()
      setExams(data)
    } catch (err) {
      toast.error('Error al cargar exámenes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  const handleEdit = (exam: Exam) => {
    navigate(`/admin/exam/edit/${exam.id}`)
  }

  const handleViewCases = (exam: Exam) => {
    navigate(`/admin/exam/${exam.id}/cases`)
  }

  const handleDelete = async (exam: Exam) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${exam.title}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(exam.id)
    try {
      await deleteExam(exam.id)
      toast.success('Examen eliminado correctamente')
      await loadExams()
    } catch (err) {
      toast.error('Error al eliminar el examen')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando exámenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los exámenes, casos y preguntas del simulacro.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/exam/create')}
          className="gap-2 bg-primary hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Crear nuevo examen
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar exámenes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Exámenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{exams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {exams.filter(e => e.is_published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {exams.filter(e => !e.is_published).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam List */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {searchTerm
              ? 'No se encontraron exámenes con ese criterio de búsqueda.'
              : 'No hay exámenes creados aún.'}
          </p>
          {!searchTerm && (
            <Button
              variant="outline"
              onClick={() => navigate('/admin/exam/create')}
              className="mt-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear primer examen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className={deletingId === exam.id ? 'opacity-50 pointer-events-none' : ''}>
              <ExamCard
                exam={exam}
                onEdit={handleEdit}
                onViewCases={handleViewCases}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

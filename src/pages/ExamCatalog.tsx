import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, FileText, Layers, Loader2, AlertTriangle } from 'lucide-react'
import { fetchPublishedExams } from '@/lib/examService'
import type { Exam } from '@/types'

const typeColors: Record<string, string> = {
  nombramiento: 'bg-blue-100 text-blue-700',
  ascenso: 'bg-green-100 text-green-700',
  desempeno: 'bg-purple-100 text-purple-700',
}

const typeLabels: Record<string, string> = {
  nombramiento: 'Nombramiento',
  ascenso: 'Ascenso',
  desempeno: 'Desempeño',
}

export function ExamCatalog() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadExams = async () => {
      try {
        const data = await fetchPublishedExams()
        if (!cancelled) {
          setExams(data)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading exams:', err)
          setError('No se pudieron cargar los exámenes. Verifica la conexión con Supabase.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadExams()
    return () => { cancelled = true }
  }, [])

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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exámenes Disponibles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un simulacro para comenzar a practicar
          </p>
        </div>
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium mb-2">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exámenes Disponibles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un simulacro para comenzar a practicar
          </p>
        </div>
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No hay exámenes disponibles en este momento.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Los exámenes aparecerán aquí cuando sean publicados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exámenes Disponibles</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona un simulacro para comenzar a practicar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className="flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={`text-xs font-medium ${typeColors[exam.type] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {typeLabels[exam.type] ?? exam.type}
                </Badge>
                {exam.year && (
                  <span className="text-xs text-gray-400">{exam.year}</span>
                )}
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {exam.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {exam.description ?? 'Sin descripción disponible'}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 mx-auto mb-1">
                    <Layers className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500">Casos</p>
                  <p className="text-sm font-semibold text-gray-900">{exam.total_cases}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 mx-auto mb-1">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500">Preguntas</p>
                  <p className="text-sm font-semibold text-gray-900">{exam.total_questions}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 mx-auto mb-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-500">Duración</p>
                  <p className="text-sm font-semibold text-gray-900">{exam.duration_minutes}min</p>
                </div>
              </div>

              {exam.difficulty_level && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Dificultad:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= (parseInt(exam.difficulty_level) || 3)
                            ? 'bg-primary'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => navigate(`/exam/${exam.id}`)}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <BookOpen className="h-4 w-4" />
                Comenzar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

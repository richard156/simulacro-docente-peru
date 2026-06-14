import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, TrendingUp, Award, Clock, ArrowRight, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUserStats, getUserAttempts } from '@/lib/attemptService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Stats {
  totalAttempts: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  totalCorrect: number
  totalQuestions: number
}

interface RecentAttempt {
  id: string
  exam_id: string
  total_score: number | null
  max_score: number | null
  accuracy_rate: number | null
  completed_at: string | null
  total_time_seconds: number | null
}

type SortField = 'date' | 'score'
type SortDirection = 'asc' | 'desc'

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [userStats, attempts] = await Promise.all([
          getUserStats(user.id),
          getUserAttempts(user.id),
        ])
        setStats(userStats)
        setRecentAttempts(attempts.slice(0, 5))
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '--'
    try {
      return format(new Date(dateStr), "d 'de' MMMM, HH:mm", { locale: es })
    } catch {
      return '--'
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedAttempts = [...recentAttempts].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    } else {
      const scoreA = a.accuracy_rate ?? 0
      const scoreB = b.accuracy_rate ?? 0
      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA
    }
  })

  const statCards = [
    {
      title: 'Simulacros Completados',
      value: stats?.totalAttempts.toString() ?? '0',
      description: stats && stats.totalAttempts > 0 ? 'En total' : 'Ninguno aún',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Puntaje Promedio',
      value: stats && stats.totalAttempts > 0 ? `${stats.averageScore}%` : '--',
      description: stats && stats.totalAttempts > 0 ? `En ${stats.totalAttempts} simulacros` : 'Completa un simulacro',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Mejor Puntaje',
      value: stats && stats.totalAttempts > 0 ? `${stats.bestScore}%` : '--',
      description: stats && stats.totalAttempts > 0 ? 'Tu récord' : 'Sin registros',
      icon: Award,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Tiempo Total',
      value: stats && stats.totalTimeSpent > 0 ? formatTime(stats.totalTimeSpent) : '0h',
      description: stats && stats.totalTimeSpent > 0 ? 'En simulacros' : 'En simulacros',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
            {user?.full_name && (
              <span className="text-primary ml-2">- {user.full_name}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.full_name
              ? `Bienvenido, ${user.full_name}. Aquí verás tu progreso.`
              : 'Bienvenido a Simulacro Docente. Aquí verás tu progreso.'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/exams')}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <BookOpen className="h-4 w-4" />
          Ver exámenes
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Últimos resultados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Últimos Resultados
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('date')}
                className={`text-xs gap-1 ${sortField === 'date' ? 'text-primary font-semibold' : 'text-gray-500'}`}
              >
                <ArrowUpDown className="h-3 w-3" />
                Fecha
                {sortField === 'date' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('score')}
                className={`text-xs gap-1 ${sortField === 'score' ? 'text-primary font-semibold' : 'text-gray-500'}`}
              >
                <ArrowUpDown className="h-3 w-3" />
                Puntaje
                {sortField === 'score' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAttempts.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Aún no has completado ningún simulacro.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/exams')}
                className="mt-4 gap-2"
              >
                Comenzar ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAttempts.map((attempt) => {
                const score = attempt.accuracy_rate ?? 0
                const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                const scoreBg = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-yellow-50' : 'bg-red-50'

                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/results/${attempt.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${scoreBg} flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Simulacro completado
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(attempt.completed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {attempt.total_score ?? 0}/{attempt.max_score ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attempt.total_time_seconds ? formatTime(attempt.total_time_seconds) : '--'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

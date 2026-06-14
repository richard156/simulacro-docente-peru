import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2, FileText, BookOpen } from 'lucide-react'
import type { Exam } from '@/types'

interface ExamCardProps {
  exam: Exam
  onEdit: (exam: Exam) => void
  onViewCases: (exam: Exam) => void
  onDelete: (exam: Exam) => void
}

const typeLabels: Record<string, { label: string; color: string }> = {
  nombramiento: { label: 'Nombramiento', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ascenso: { label: 'Ascenso', color: 'bg-green-100 text-green-700 border-green-200' },
  desempeno: { label: 'Desempeño', color: 'bg-purple-100 text-purple-700 border-purple-200' },
}

export function ExamCard({ exam, onEdit, onViewCases, onDelete }: ExamCardProps) {
  const typeInfo = typeLabels[exam.type] ?? { label: exam.type, color: 'bg-gray-100 text-gray-700 border-gray-200' }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-gray-900">
              {exam.title}
            </CardTitle>
            {exam.description && (
              <CardDescription className="text-sm text-gray-500 line-clamp-2">
                {exam.description}
              </CardDescription>
            )}
          </div>
          <Badge
            variant="outline"
            className={`ml-2 shrink-0 ${typeInfo.color}`}
          >
            {typeInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {exam.specialty && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {exam.specialty}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {exam.total_cases} casos
          </span>
          <span>
            {exam.total_questions} preguntas
          </span>
          <span>
            {exam.duration_minutes} min
          </span>
          <Badge variant={exam.is_published ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
            {exam.is_published ? 'Publicado' : 'Borrador'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(exam)}
            className="gap-1.5 text-xs"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewCases(exam)}
            className="gap-1.5 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver casos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(exam)}
            className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ml-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

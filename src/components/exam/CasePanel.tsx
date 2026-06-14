import { useExamStore } from '@/stores/examStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, Lightbulb, Target } from 'lucide-react'

export function CasePanel() {
  const { cases, currentCaseIndex } = useExamStore()
  const currentCase = cases[currentCaseIndex]

  if (!currentCase) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-400 text-sm">Selecciona un caso para ver su contenido</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado del caso */}
      <div className="px-5 py-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            Caso {currentCase.case_number}
          </span>
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          {currentCase.title ?? `Caso ${currentCase.case_number}`}
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {currentCase.subject_area && (
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {currentCase.subject_area}
            </Badge>
          )}
          {currentCase.grade_level && (
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
              {currentCase.grade_level}
            </Badge>
          )}
          {currentCase.curricular_area && (
            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {currentCase.curricular_area}
            </Badge>
          )}
        </div>
      </div>

      {/* Contenido del caso */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
          {/* Contexto */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contexto
              </h3>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {currentCase.context_text}
            </div>
            {currentCase.word_count && (
              <p className="text-xs text-gray-400 mt-2">
                {currentCase.word_count} palabras
              </p>
            )}
          </div>

          {/* Enfoque pedagógico */}
          {currentCase.pedagogical_focus && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Enfoque Pedagógico
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentCase.pedagogical_focus}
              </p>
            </div>
          )}

          {/* Puntos clave */}
          {currentCase.key_points && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Puntos Clave
                </h3>
              </div>
              <ul className="space-y-1">
                {Object.entries(currentCase.key_points).map(([key, value]) => (
                  <li key={key} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{String(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fuente */}
          {currentCase.source && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                <span className="font-medium">Fuente:</span> {currentCase.source}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

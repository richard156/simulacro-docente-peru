import { useMemo } from 'react'

interface HTMLContentProps {
  html: string
  className?: string
  as?: 'div' | 'p' | 'span'
}

/**
 * Componente seguro para renderizar contenido HTML.
 * Se usa para mostrar textos enriquecidos provenientes del editor RichTextEditor.
 */
export function HTMLContent({ html, className = '', as: Tag = 'div' }: HTMLContentProps) {
  const sanitizedHtml = useMemo(() => {
    if (!html) return ''
    // Limpiar HTML básico para evitar XSS
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
  }, [html])

  if (!sanitizedHtml) return null

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

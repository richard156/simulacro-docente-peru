import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3 } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  error?: string
}

// Extensión personalizada para tamaño de fuente
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize,
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },
})

export function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí...', minHeight = '200px', error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Actualizar contenido cuando cambia el value externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [editor, value])

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])

  const toggleHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run()
  }, [editor])

  const setTextAlign = useCallback((align: string) => {
    editor?.chain().focus().setTextAlign(align).run()
  }, [editor])

  const setFontSize = useCallback((size: string) => {
    editor?.chain().focus().setMark('textStyle', { fontSize: size }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`border rounded-md ${error ? 'border-red-500' : 'border-input'}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 rounded-t-md">
        {/* Negrita */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={toggleBold}
          aria-label="Negrita"
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        {/* Cursiva */}
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={toggleItalic}
          aria-label="Cursiva"
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        {/* Subrayado */}
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={toggleUnderline}
          aria-label="Subrayado"
          title="Subrayado (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Tamaño de fuente */}
        <Select onValueChange={setFontSize}>
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue placeholder="Tamaño" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12px</SelectItem>
            <SelectItem value="14px">14px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="18px">18px</SelectItem>
            <SelectItem value="20px">20px</SelectItem>
            <SelectItem value="24px">24px</SelectItem>
            <SelectItem value="28px">28px</SelectItem>
            <SelectItem value="32px">32px</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Títulos */}
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => toggleHeading(1)}
          aria-label="Título 1"
          title="Título grande"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => toggleHeading(2)}
          aria-label="Título 2"
          title="Título mediano"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => toggleHeading(3)}
          aria-label="Título 3"
          title="Título pequeño"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Listas */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={toggleBulletList}
          aria-label="Lista con viñetas"
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={toggleOrderedList}
          aria-label="Lista numerada"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alineación */}
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => setTextAlign('left')}
          aria-label="Alinear izquierda"
          title="Alinear izquierda"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => setTextAlign('center')}
          aria-label="Centrar"
          title="Centrar"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => setTextAlign('right')}
          aria-label="Alinear derecha"
          title="Alinear derecha"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3"
        style={{ minHeight }}
      />
    </div>
  )
}

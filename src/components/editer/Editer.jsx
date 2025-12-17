import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import './Editor.css'
import ToolBar from './Toolbar'

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing here...',
      }),
    ],
    content: '<p>Hello Writer! 👋</p>',
  })

  return (
    <div className="editor-container">
      <ToolBar editor={editor}/>
      <EditorContent editor={editor} />
    </div>
  )
}
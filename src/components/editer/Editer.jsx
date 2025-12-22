import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Underline } from '@tiptap/extension-underline'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { FontSize } from './FontSize'
import ToolBar from './Toolbar'
import './Editor.css'

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Image,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing here...",
      }),
    ],
    content: "<p>Article Text</p>",
  });

  return (
    <div className="editor-container">
      <ToolBar editor={editor} />
      <div className="editor-scroll">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}


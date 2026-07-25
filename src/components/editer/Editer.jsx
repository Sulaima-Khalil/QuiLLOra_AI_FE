
import { forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontSize } from './FontSize';
import ToolBar from './Toolbar';
import './Editor.css';

const Editor = forwardRef(function Editor({ initialContent, onCreate, onUpdate }, ref) {
  const editor = useEditor({
    editable: true,
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Image,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing here...",
        showOnlyWhenEditable: true,
      }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor: ed }) => {
      if (!onUpdate) return;
      const text = ed.getText();
      const headings = [];
      ed.state.doc.descendants((node) => {
        if (node.type.name === "heading" && node.textContent.trim()) {
          headings.push({ level: node.attrs.level, text: node.textContent.trim() });
        }
      });
      onUpdate({ html: ed.getHTML(), text, headings });
    },
  });

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || "",
    isEmpty: () => editor?.isEmpty ?? true,
    insertContent: (html) => editor?.chain().focus("end").insertContent(html).run(),
  }), [editor]);

  return (
    <div className="editor-container">
      <ToolBar editor={editor} onCreate={onCreate} />
      <div className="editor-scroll">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default Editor;


import { forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
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
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Type / for commands or start writing...",
        showOnlyWhenEditable: true,
      }),
    ],
    content: initialContent || "",
    onCreate: ({ editor: ed }) => {
      if (onCreate) onCreate(ed);
    },
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
    getSelectedText: () => {
      if (!editor) return "";
      const { from, to } = editor.state.selection;
      return editor.state.doc.textBetween(from, to, "");
    },
    insertContent: (html) => editor?.chain().focus().insertContent(html).run(),
    setContent: (html) => editor?.commands.setContent(html),
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

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import {
  Heading1,
  Heading2,
  Bold,
  Italic,
  Link2,
  List,
  Quote,
} from "lucide-react";
import "./aiwriter.css";

const ToolbarButton = ({ active, onClick, children, label }) => (
  <button
    type="button"
    className={`aiw-toolbtn${active ? " is-active" : ""}`}
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);

const DocumentCanvas = forwardRef(function DocumentCanvas(
  { initialContent, onUpdate, title, onTitleChange, meta },
  ref
) {
  const titleRef = useRef(null);

  const resizeTitle = () => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(resizeTitle, [title]);

  const editor = useEditor({
    editable: true,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: false }),
      Placeholder.configure({
        placeholder: "Start writing here...",
        showOnlyWhenEditable: true,
      }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor: ed }) => {
      onUpdate?.(ed.getHTML(), ed.getText());
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      insertParagraph: (html) =>
        editor?.chain().focus("end").insertContent(html).run(),
    }),
    [editor]
  );

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="aiw-canvas">
      <div className="aiw-toolbar-wrap">
        <div className="aiw-toolbar">
          <ToolbarButton
            label="Heading 1"
            active={editor?.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <span className="aiw-toolbar-sep" />
          <ToolbarButton
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor?.isActive("link")} onClick={setLink}>
            <Link2 size={16} />
          </ToolbarButton>
          <span className="aiw-toolbar-sep" />
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor?.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={16} />
          </ToolbarButton>
        </div>
      </div>

      <div className="aiw-page">
        {meta && (
          <div className="aiw-page-meta">
            {meta}
          </div>
        )}
        <textarea
          ref={titleRef}
          className="aiw-page-title"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Untitled document"
          rows={1}
        />
        <EditorContent editor={editor} className="aiw-prose" />
      </div>
    </div>
  );
});

export default DocumentCanvas;

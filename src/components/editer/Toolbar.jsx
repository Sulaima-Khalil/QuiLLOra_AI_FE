import { useState } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter,
  Link2, Image, MoreHorizontal, ChevronDown,
} from "lucide-react";

const ToolButton = ({ label, active, children, onClick }) => (
  <button type="button" className={`editor-tool ${active ? "is-active" : ""}`} onClick={onClick} aria-label={label} title={label}>
    {children}
  </button>
);

const textStyles = [
  { label: "Paragraph", value: null, preview: "paragraph" },
  ...[1, 2, 3, 4, 5, 6].map((level) => ({ label: `Heading ${level}`, value: level, preview: `heading-${level}` })),
];

const ToolBar = ({ editor }) => {
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  if (!editor) return null;
  const activeHeading = [1, 2, 3, 4, 5, 6].find((level) => editor.isActive("heading", { level }));
  const activeStyle = activeHeading ? `Heading ${activeHeading}` : "Paragraph";
  const applyTextStyle = (level) => {
    const chain = editor.chain().focus();
    if (level) chain.setHeading({ level }).run();
    else chain.setParagraph().run();
    setStyleMenuOpen(false);
  };
  const addImage = () => {
    const url = window.prompt("Enter an image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  const addLink = () => {
    const url = window.prompt("Enter a link URL");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
      <div className="editor-style-picker">
        <button type="button" className="editor-style-menu" onClick={() => setStyleMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={styleMenuOpen}>
          {activeStyle}<ChevronDown size={15} />
        </button>
        {styleMenuOpen && <div className="editor-style-popup" role="menu" aria-label="Text style">
          {textStyles.map(({ label, value, preview }) => <button key={label} type="button" role="menuitem" className={`editor-style-option ${preview} ${activeStyle === label ? "is-active" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => applyTextStyle(value)}>{label}</button>)}
        </div>}
      </div>
      <span className="toolbar-divider" />
      <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={19} /></ToolButton>
      <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={19} /></ToolButton>
      <ToolButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={19} /></ToolButton>
      <span className="toolbar-divider" />
      <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={19} /></ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={19} /></ToolButton>
      <ToolButton label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={19} /></ToolButton>
      <ToolButton label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={19} /></ToolButton>
      <span className="toolbar-divider toolbar-divider-wide" />
      <ToolButton label="Add link" onClick={addLink}><Link2 size={19} /></ToolButton>
      <ToolButton label="Insert image" onClick={addImage}><Image size={19} /></ToolButton>
      <ToolButton label="More options" onClick={() => editor.chain().focus().setHorizontalRule().run()}><MoreHorizontal size={20} /></ToolButton>
    </div>
  );
};

export default ToolBar;

const ToolBar = ({ editor }) => {
  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }
   const saveContent = () => {
  const content = editor.getHTML()
  localStorage.setItem('document', content)
  alert('Saved locally!')
}

const exportAsPDF = () => {
  // Use jsPDF library
  console.log('Export as PDF functionality')
}

const exportAsDOC = () => {
  // Use mammoth.js or similar
  console.log('Export as DOC functionality')
}
  return (
    <div className="menu-bar">
      {/* Text Formatting */}
      <div className="formatting-group">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
      </div>
      
      {/* Headings */}
      <div className="headings-group">
        <button onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      </div>
      
      {/* Lists */}
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
      
      {/* Alignment */}
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>←</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>↔</button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>→</button>
      
      {/* Custom Features */}
      <button onClick={addImage}>🖼️ Image</button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>― HR</button>
      <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear</button>
       
       <button onClick={saveContent}>💾 Save</button>
       <button onClick={exportAsPDF}>📄 PDF</button>
       <button onClick={exportAsDOC}>📝 DOC</button>
    </div>
  )
}

export default ToolBar;
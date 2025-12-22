import { VscItalic } from "react-icons/vsc";
import { PiTextBBold } from "react-icons/pi";
import { FaListUl } from "react-icons/fa";
import { FaListOl } from "react-icons/fa";
import { BsImageFill } from "react-icons/bs";
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
  
  console.log('Export as PDF functionality')
}

const exportAsDOC = () => {
 
  console.log('Export as DOC functionality')
}
  return (
    <div className="menu-bar">
      
      <div className="formatting-group">
        <button onClick={() => editor.chain().focus().toggleBold().run()}><PiTextBBold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}><VscItalic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
      </div>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}><FaListOl /></button>
      
      {/* <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>←</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>↔</button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>→</button> */}
      
      
      <button onClick={addImage}><BsImageFill /></button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>― HR</button>
        <div style={{display:'flex', gap: 15, alignItems:'center'}}>
    <p>Size:</p>
    <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}>
    <option value="12px">12</option>
    <option value="14px">14</option>
    <option value="16px">16</option>
    <option value="18px">18</option>
    <option value="24px">24</option>
  </select>
      </div>
      {/* <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear</button> */}
       
       {/* <button onClick={saveContent}>💾 Save</button>
       <button onClick={exportAsPDF}>📄 PDF</button>
       <button onClick={exportAsDOC}>📝 DOC</button> */}
    </div>
  )
}

export default ToolBar;
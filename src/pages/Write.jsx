
import  Editor  from '../components/editer/Editer';
import { AiOutlineFileText } from "react-icons/ai";
export const Write = () => {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:30,margin:30}}>
      <div style={{display:'flex', justifyContent:'space-between',alignItems:'center'}}>
        <h2><span style={{fontSize:18}}>Draft  </span>/ Untitled Article</h2>

        <div style={{display:'flex',gap:40}}>
          {/* <button style={{border:'none', background:'black'}}> Preview</button> */}
          <button style={{width:100 ,height:40 , padding:8, borderRadius:6, background: "#7c5cff",}}>
            <AiOutlineFileText style={{background: "#7c5cff"}}/> Publish
            </button>
        </div>
      </div>
      <Editor />
    </div>
  )
}

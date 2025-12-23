import { Header } from '../shared/Header';

export const Account = () => {
    const getInitials=(name)=>{
  if(!name) return " ";
  const words=name.split();
  if(words.length === 1) return words[0][0].toUpperCase();
  return words[0][0].toUpperCase() + words[1][0].toUpperCase();
}
  return (
    <div className='card' style={{ maxWidth:400 , height:'auto', border:'2px solid #1F1F1F', padding:20 ,borderRadius:12 }}>
      <Header 
      title="Profile Information"
      description="Update your photo and personal details..."
      />
        <div style={{display:'flex',gap:16 , paddingTop:30}}>
             <div 
                style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: "#7c5cff", 
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                   
                    fontWeight: "bold",
                    fontSize: 24,
                    marginRight: 8,
                }}>
                    {getInitials("Sulaima khalil")}
            </div>
            <div 
            style={{display:'flex',flexDirection:'column',gap:16 ,alignItems:'center'}}
            >
            <div style={{display:'flex',gap:16 ,alignItems:'center'}}>
                <button style={{background:'black', width:120,borderRadius:12 ,height:37}}>Change Photo</button>
                <button style={{background:'none',border:'none' ,color:'orange'}}>Remove</button>
            </div>
            <span style={{fontSize:12}}>JPG, GIF or PNG. Max sixe of 800K</span>
            </div>
            </div>
      <div style={{ display: 'flex', flexWrap:'wrap',gap: 30,paddingTop:40  }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 175 }}>
        <label>First Name</label>
        <input
          aria-label="first-name"
          value="Sulaima"
          style={{
            background: 'none',
            border: '1px solid gray',
            borderRadius: 6,
            width: '100%',
            padding: 8,
            height:30
          }}
        />
        </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 175 }}>
        <label>Last Name</label>
        <input
          aria-label="last-name"
          value="Khalil"
          style={{
            background: 'none',
            border: '1px solid gray',
            borderRadius: 6,
            width: '100%',
            padding: 8,
            height:30
          }}
        />
        </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '95%' }}>
        <label>Email</label>
        <input
          aria-label="email"
          value="sulaima@example.com"
          style={{
            background: 'none',
            border: '1px solid gray',
            borderRadius: 6,
            width: '100%',
            padding: 8,
            height:30
          }}
        />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '95%', paddingTop: 16 }}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          aria-label="bio"
          value="Web developer and passionate hardworker to design websites and web applications"
          style={{
            background: 'none',
            border: '1px solid gray',
            borderRadius: 4,
            width: '100%',
            padding: 8,
            minHeight: 50,  
            maxHeight:70,
            resize: 'vertical' 
          }}
        />
      </div>
      
      
              </div>
  )
}

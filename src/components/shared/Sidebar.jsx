import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
export const Sidebar = ({ content , ActiveIndex, activeIndicator}) => {
     const [activeIndex, setActiveIndex] = useState(0);
    const navigate=useNavigate();


     const handleItemClick = (index) => {
        setActiveIndex(index);
    };
  return (
     <div style={{
            display: 'flex',
            flexDirection: 'column',
            // backgroundColor: '#1e293b',
            padding: '16px 0',
        }}>
            {content.map((item, index) => (
                <div
                    key={index}
                    onClick={() => {handleItemClick(index); navigate(item.path)}}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: activeIndex === index ? '#ffffff' : '#cbd5e1',
                        width: 250,
                        padding: '12px 24px',
                        margin: '4px 12px',
                        backgroundColor: activeIndex === index ? 'black' : 'black',
                        borderRadius: '8px',
                        border: activeIndex === index ? '1px solid #7c5cff' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        // '&:hover': {
                        //     backgroundColor: activeIndex !== index ? '#2d3748' : '#334155',
                        // }
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '18px',
                        fontWeight: activeIndex === index ? '500' : '400',
                        // backgroundColor: activeIndex === index ? '#334155' : 'black',
                    }}>
                       

                        <span style={{
                            fontSize: '22px',
                        }}>
                            {item.icon}
                        </span>
                        {item.title}
                    </div>
                    
                    {/* Active Indicator */}
                    {activeIndicator &&(
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: activeIndex === index ? '#7c5cff' : 'transparent',
                        opacity: activeIndex === index ? 1 : 0,
                        transition: 'all 0.3s ease',
                        boxShadow: activeIndex === index ? '0 0 8px #7c5cff' : 'none'
                    }}></div>
                    )}
                  
                    {ActiveIndex && activeIndex === index && (
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '60%',
                            backgroundColor: '#7c5cff',
                            borderRadius: '0 4px 4px 0'
                        }}></div>
                    )}
                </div>
            ))}
        </div>
  )
}

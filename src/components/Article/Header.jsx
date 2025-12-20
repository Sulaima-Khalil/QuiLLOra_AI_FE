
import { Header } from '../shared/Header';
import { useNavigate } from 'react-router-dom';
export const ArticleHeader = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/Write')
    }
  return (
       <div>
        <Header 
         title="Article"
         description="Manage your published work and drafts..."
         isButton={true}
         content="+ New Article"
         handleClick={handleClick}
        />
    </div>
  )
}

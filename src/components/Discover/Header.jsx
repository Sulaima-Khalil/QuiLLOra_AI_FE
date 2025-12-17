import { Header } from '../shared/Header'
import { useNavigate} from 'react-router-dom';
export const DiscoveryHeader = () => {
  const navigate = useNavigate();
   const handleClick = () => {
           navigate('/Setting')
   }
  return (
    

<div>
  <Header
     title="Discover"
     description="Explore the latest thoughts on Design and Technology..."
     isDiscover={true}
     handleClick={handleClick}
  />
 </div>
  )
}

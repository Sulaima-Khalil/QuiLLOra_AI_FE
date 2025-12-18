
import { Navigate } from 'react-router-dom';

export const GuestRoute = ({ children }) => {
  
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return !!token;
  };

  if (isAuthenticated()) {
   
    return <Navigate to="/" replace />;
  }

  
  return children;
};
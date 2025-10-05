import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}


import { Navigate, Outlet } from 'react-router-dom';

import { useJwtService } from '@app/hooks/useJwtService';

export const ProtectedRoute = () => {
  const jwtService = useJwtService();

  const isAuthenticated = jwtService.get() !== null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

import { Navigate, Outlet } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

export const ProtectedRoute = () => {
  const [jwt] = useLocalStorage('jwt', '');

  const isAuthenticated = Boolean(jwt);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

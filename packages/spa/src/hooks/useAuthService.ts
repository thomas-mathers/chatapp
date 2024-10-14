import { AuthService } from 'chatapp.api';
import { useContext } from 'react';

import { AuthServiceContext } from '../contexts/AuthServiceContext';

export const useAuthService = (): AuthService => {
  const authService = useContext(AuthServiceContext);
  if (!authService) {
    throw new Error('AuthService not found');
  }
  return authService;
};

import { AuthServiceClient } from 'chatapp.api-clients';
import { useContext } from 'react';

import { AuthServiceContext } from '@app/contexts/authServiceContext';

export const useAuthService = (): AuthServiceClient => {
  const authService = useContext(AuthServiceContext);
  if (!authService) {
    throw new Error('AuthService not found');
  }
  return authService;
};

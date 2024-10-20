import { JwtService } from 'chatapp.api-clients';
import { useContext } from 'react';

import { JwtServiceContext } from '@app/contexts/jwtServiceContext';

export const useJwtService = (): JwtService => {
  const jwtService = useContext(JwtServiceContext);
  if (!jwtService) {
    throw new Error('JwtService not found');
  }
  return jwtService;
};

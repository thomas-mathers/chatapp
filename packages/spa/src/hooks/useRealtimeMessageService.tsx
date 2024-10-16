import { useContext } from 'react';

import { RealtimeMessageServiceContext } from '@app/contexts/realtimeMessageServiceContext';
import { RealtimeMessageService } from '@app/services/realtimeMessageService';

export const useRealtimeMessageService = (): RealtimeMessageService => {
  const realtimeMessageService = useContext(RealtimeMessageServiceContext);
  if (!realtimeMessageService) {
    throw new Error('AccountService not found');
  }
  return realtimeMessageService;
};

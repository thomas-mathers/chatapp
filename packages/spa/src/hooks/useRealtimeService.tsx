import { useContext } from 'react';

import { RealtimeServiceContext } from '@app/contexts/realtimeServiceContext';
import { RealtimeService } from '@app/services/realtimeService';

export const useRealtimeService = (): RealtimeService => {
  const realtimeMessageService = useContext(RealtimeServiceContext);
  if (!realtimeMessageService) {
    throw new Error('RealtimeService not found');
  }
  return realtimeMessageService;
};

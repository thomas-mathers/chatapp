import { useContext } from 'react';

import { RealtimeServiceContext } from '@app/contexts/realtime-service-context';
import { RealtimeService } from '@app/services/realtime-service';

export const useRealtimeService = (): RealtimeService => {
  const realtimeMessageService = useContext(RealtimeServiceContext);
  if (!realtimeMessageService) {
    throw new Error('RealtimeService not found');
  }
  return realtimeMessageService;
};

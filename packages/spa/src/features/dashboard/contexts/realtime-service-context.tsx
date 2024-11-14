import { createContext, useContext } from 'react';

import { RealtimeService } from '@app/lib/realtime-service';

export const RealtimeServiceContext = createContext<RealtimeService | null>(
  null,
);

export const useRealtimeService = (): RealtimeService => {
  const realtimeMessageService = useContext(RealtimeServiceContext);
  if (!realtimeMessageService) {
    throw new Error('RealtimeService not found');
  }
  return realtimeMessageService;
};

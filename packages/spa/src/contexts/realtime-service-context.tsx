import { createContext } from 'react';

import { RealtimeService } from '@app/services/realtime-service';

export const RealtimeServiceContext = createContext<RealtimeService | null>(
  null,
);

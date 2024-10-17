import { createContext } from 'react';

import { RealtimeService } from '@app/services/realtimeService';

export const RealtimeServiceContext = createContext<RealtimeService | null>(
  null,
);

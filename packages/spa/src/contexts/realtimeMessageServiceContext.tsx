import { createContext } from 'react';

import { RealtimeMessageService } from '@app/services/realtimeMessageService';

export const RealtimeMessageServiceContext =
  createContext<RealtimeMessageService | null>(null);

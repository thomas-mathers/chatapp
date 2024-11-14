import { MessageServiceClient } from 'chatapp.api-clients';
import { createContext } from 'react';

export const MessageServiceContext = createContext<MessageServiceClient | null>(
  null,
);

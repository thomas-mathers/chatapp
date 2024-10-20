import { MessageService } from 'chatapp.api-clients';
import { createContext } from 'react';

export const MessageServiceContext = createContext<MessageService | null>(null);

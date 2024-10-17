import { MessageService } from 'chatapp.api';
import { createContext } from 'react';

export const MessageServiceContext = createContext<MessageService | null>(null);

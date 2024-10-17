import { MessageService } from 'chatapp.api';
import { useContext } from 'react';

import { MessageServiceContext } from '@app/contexts/messageServiceContext';

export const useMessageService = (): MessageService => {
  const messageService = useContext(MessageServiceContext);
  if (!messageService) {
    throw new Error('AccountService not found');
  }
  return messageService;
};

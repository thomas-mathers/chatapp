import { MessageServiceClient } from 'chatapp.api-clients';
import { useContext } from 'react';

import { MessageServiceContext } from '@app/contexts/messageServiceContext';

export const useMessageService = (): MessageServiceClient => {
  const messageService = useContext(MessageServiceContext);
  if (!messageService) {
    throw new Error('AccountService not found');
  }
  return messageService;
};

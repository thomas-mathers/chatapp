import { AccountServiceClient } from 'chatapp.api-clients';
import { useContext } from 'react';

import { AccountServiceContext } from '@app/contexts/accountServiceContext';

export const useAccountService = (): AccountServiceClient => {
  const accountService = useContext(AccountServiceContext);
  if (!accountService) {
    throw new Error('AccountService not found');
  }
  return accountService;
};

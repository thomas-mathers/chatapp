import { AccountService } from 'chatapp.api';
import { useContext } from 'react';

import { AccountServiceContext } from '@app/contexts/accountServiceContext';

export const useAccountService = (): AccountService => {
  const accountService = useContext(AccountServiceContext);
  if (!accountService) {
    throw new Error('AccountService not found');
  }
  return accountService;
};

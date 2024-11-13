import { AccountServiceClient } from 'chatapp.api-clients';
import { createContext } from 'react';

export const AccountServiceContext = createContext<AccountServiceClient | null>(
  null,
);

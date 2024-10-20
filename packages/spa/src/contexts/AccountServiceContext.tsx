import { AccountService } from 'chatapp.api-clients';
import { createContext } from 'react';

export const AccountServiceContext = createContext<AccountService | null>(null);

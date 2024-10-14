import { AccountService } from 'chatapp.api';
import { createContext } from 'react';

export const AccountServiceContext = createContext<AccountService | null>(null);

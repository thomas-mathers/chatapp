import { AuthService } from 'chatapp.api-clients';
import { createContext } from 'react';

export const AuthServiceContext = createContext<AuthService | null>(null);

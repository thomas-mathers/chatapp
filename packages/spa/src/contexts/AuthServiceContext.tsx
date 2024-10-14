import { AuthService } from 'chatapp.api';
import { createContext } from 'react';

export const AuthServiceContext = createContext<AuthService | null>(null);

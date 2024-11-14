import { AuthServiceClient } from 'chatapp.api-clients';
import { createContext } from 'react';

export const AuthServiceContext = createContext<AuthServiceClient | null>(null);

import { JwtService } from 'chatapp.api-clients';
import { createContext } from 'react';

export const JwtServiceContext = createContext<JwtService | null>(null);

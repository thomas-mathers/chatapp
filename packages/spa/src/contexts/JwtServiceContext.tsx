import { JwtService } from 'chatapp.api';
import { createContext } from 'react';

export const JwtServiceContext = createContext<JwtService | null>(null);

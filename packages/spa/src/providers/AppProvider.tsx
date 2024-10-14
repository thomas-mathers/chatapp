import { ThemeProvider } from '@emotion/react';
import type {} from '@mui/lab/themeAugmentation';
import { createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AccountService,
  ApiClient,
  AuthService,
  JwtService,
} from 'chatapp.api';

import { getConfig } from '@app/config';

import { AccountServiceProvider } from './AccountServiceProvider';
import { AuthServiceProvider } from './AuthServiceProvider';
import { JwtServiceProvider } from './JwtServiceProvider';

const config = getConfig();

const theme = createTheme({
  components: {
    MuiTimeline: {
      styleOverrides: {
        root: {
          backgroundColor: 'red',
        },
      },
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

const queryClient = new QueryClient();

const jwtTokenService = new JwtService();

const accountServiceApiClient = new ApiClient(
  config.VITE_ACCOUNT_SERVICE_BASE_URL,
  jwtTokenService,
);
const accountService = new AccountService(accountServiceApiClient);

const authServiceApiClient = new ApiClient(
  config.VITE_AUTH_SERVICE_BASE_URL,
  jwtTokenService,
);
const authService = new AuthService(authServiceApiClient);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <JwtServiceProvider value={jwtTokenService}>
          <AccountServiceProvider value={accountService}>
            <AuthServiceProvider value={authService}>
              {children}
            </AuthServiceProvider>
          </AccountServiceProvider>
        </JwtServiceProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

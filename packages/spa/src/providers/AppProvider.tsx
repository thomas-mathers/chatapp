import { ThemeProvider } from '@emotion/react';
import type {} from '@mui/lab/themeAugmentation';
import { createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AccountService,
  ApiClient,
  AuthService,
  JwtTokenService,
} from 'chatapp.api';

import { getConfig } from '@app/config';

import { AccountServiceProvider } from './AccountServiceProvider';
import { AuthServiceProvider } from './AuthServiceProvider';

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

const jwtTokenService = new JwtTokenService();

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
        <AccountServiceProvider value={accountService}>
          <AuthServiceProvider value={authService}>
            {children}
          </AuthServiceProvider>
        </AccountServiceProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

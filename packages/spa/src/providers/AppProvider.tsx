import { ThemeProvider } from '@emotion/react';
import type {} from '@mui/lab/themeAugmentation';
import { createTheme } from '@mui/material';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  AccountService,
  ApiClient,
  ApiError,
  AuthService,
  MessageService,
} from 'chatapp.api';

import { getConfig } from '@app/config';
import { LocalStorageJwtService } from '@app/services/localStorageJwtService';

import { AccountServiceProvider } from './accountServiceProvider';
import { AuthServiceProvider } from './authServiceProvider';
import { JwtServiceProvider } from './jwtServiceProvider';
import { MessageServiceProvider } from './messageServiceProvider';

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

const jwtTokenService = new LocalStorageJwtService();

const accountServiceApiClient = new ApiClient(
  config.VITE_ACCOUNT_SERVICE_BASE_URL,
);
const accountService = new AccountService(
  accountServiceApiClient,
  jwtTokenService,
);

const authServiceApiClient = new ApiClient(config.VITE_AUTH_SERVICE_BASE_URL);
const authService = new AuthService(authServiceApiClient, jwtTokenService);

const messageServiceApiClient = new ApiClient(
  config.VITE_MESSAGE_SERVICE_BASE_URL,
);
const messageService = new MessageService(
  messageServiceApiClient,
  jwtTokenService,
);

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        window.location.href = '/';
      }
    },
  }),
});

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
              <MessageServiceProvider value={messageService}>
                {children}
              </MessageServiceProvider>
            </AuthServiceProvider>
          </AccountServiceProvider>
        </JwtServiceProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

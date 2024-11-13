import { ThemeProvider } from '@emotion/react';
import type {} from '@mui/lab/themeAugmentation';
import { createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AccountServiceClient,
  ApiClient,
  AuthServiceClient,
  MessageServiceClient,
} from 'chatapp.api-clients';

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
const accountService = new AccountServiceClient(
  accountServiceApiClient,
  jwtTokenService,
);

const authServiceApiClient = new ApiClient(config.VITE_AUTH_SERVICE_BASE_URL);
const authService = new AuthServiceClient(
  authServiceApiClient,
  jwtTokenService,
);

const messageServiceApiClient = new ApiClient(
  config.VITE_MESSAGE_SERVICE_BASE_URL,
);
const messageService = new MessageServiceClient(
  messageServiceApiClient,
  jwtTokenService,
);

const queryClient = new QueryClient();

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

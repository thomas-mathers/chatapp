import { ThemeProvider } from '@emotion/react';
import type {} from '@mui/lab/themeAugmentation';
import { createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AccountServiceClient,
  AuthServiceClient,
  HttpClient,
  MessageServiceClient,
} from 'chatapp.api-clients';

import { getConfig } from '@app/config';

import { AccountServiceProvider } from './accountServiceProvider';
import { AuthServiceProvider } from './authServiceProvider';
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

const accountServiceApiClient = new HttpClient(
  config.VITE_ACCOUNT_SERVICE_BASE_URL,
);
const accountService = new AccountServiceClient(accountServiceApiClient);

const authServiceApiClient = new HttpClient(config.VITE_AUTH_SERVICE_BASE_URL);
const authService = new AuthServiceClient(authServiceApiClient);

const messageServiceApiClient = new HttpClient(
  config.VITE_MESSAGE_SERVICE_BASE_URL,
);
const messageService = new MessageServiceClient(messageServiceApiClient);

const queryClient = new QueryClient();

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AccountServiceProvider value={accountService}>
          <AuthServiceProvider value={authService}>
            <MessageServiceProvider value={messageService}>
              {children}
            </MessageServiceProvider>
          </AuthServiceProvider>
        </AccountServiceProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

import type {} from '@mui/lab/themeAugmentation';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';

import i18n from '../i18n';
import { theme } from '../theme';

const queryClient = new QueryClient();

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>{children}</SnackbarProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

import {
  AccountServiceClient,
  AuthServiceClient,
  HttpClient,
  MessageServiceClient,
} from 'chatapp.api-clients';

import { getConfig } from '@app/config';

const config = getConfig();

export const accountService = new AccountServiceClient(
  new HttpClient(config.VITE_ACCOUNT_SERVICE_BASE_URL),
);

export const authService = new AuthServiceClient(
  new HttpClient(config.VITE_AUTH_SERVICE_BASE_URL),
);

export const messageService = new MessageServiceClient(
  new HttpClient(config.VITE_MESSAGE_SERVICE_BASE_URL),
);

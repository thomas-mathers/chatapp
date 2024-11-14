import { AccountCreated } from './events/account-created';
import { RequestResetPassword } from './events/request-reset-password';

export type ChatAppEvent = RequestResetPassword | AccountCreated;

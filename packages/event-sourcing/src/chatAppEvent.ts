import { AccountCreated } from './events/accountCreated';
import { RequestResetPassword } from './events/requestResetPassword';

export type ChatAppEvent = RequestResetPassword | AccountCreated;

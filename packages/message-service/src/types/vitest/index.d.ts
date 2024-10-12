import { UserCredentials } from 'chatapp.crypto';

import { App } from '../../../app';

export {};

declare module 'vitest' {
  export interface TestContext {
    app: App;
    credentials: UserCredentials;
    token: string;
  }
}

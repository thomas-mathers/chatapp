import { App } from '../../../app';

export {};

declare module 'vitest' {
  export interface TestContext {
    app: App;
  }
}

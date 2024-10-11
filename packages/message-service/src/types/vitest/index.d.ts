import { UserCredentials } from 'chatapp.crypto';
import { Server } from 'http';

export {};

declare module 'vitest' {
  export interface TestContext {
    mongoClient: MongoClient;
    mongoDatabase: Db;
    app: Server;
    credentials: UserCredentials;
    token: string;
  }
}

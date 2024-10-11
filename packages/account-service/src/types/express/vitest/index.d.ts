import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';

export {};

declare module 'vitest' {
  export interface TestContext {
    mongoClient: MongoClient;
    mongoDatabase: Db;
    app: Server;
  }
}

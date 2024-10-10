import { Application } from 'express';
import { ClientSession, MongoClient } from 'mongodb';

export {};

declare module 'vitest' {
  export interface TestContext {
    mongoClient: MongoClient;
    mongoSession: ClientSession;
    app: Application;
  }
}

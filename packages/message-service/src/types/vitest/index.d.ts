import { UserCredentials } from 'chatapp.crypto';
import { Application } from 'express';
import { MongoClient } from 'mongodb';

export {};

declare module 'vitest' {
  export interface TestContext {
    mongoClient: MongoClient;
    mongoSession: ClientSession;
    app: Application;
    credentials: UserCredentials;
    token: string;
  }
}

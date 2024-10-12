import { UserCredentials } from 'chatapp.crypto';
import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import { Server as WebSocketServer } from 'ws';

export {};

declare module 'vitest' {
  export interface TestContext {
    mongoClient: MongoClient;
    mongoDatabase: Db;
    app: Server;
    credentials: UserCredentials;
    token: string;
    webSocketServer: WebSocketServer;
  }
}

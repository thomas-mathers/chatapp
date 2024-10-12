export {};

declare module 'vitest' {
  export interface TestContext {
    mongoClient: MongoClient;
    mongoDatabase: Db;
    app: Server;
  }
}

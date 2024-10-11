import { faker } from '@faker-js/faker';
import { Logger } from 'chatapp.logging';
import { TestContext, afterEach, beforeEach } from 'vitest';

import { launchHttpServer, setupDatabase, setupEventBus } from './app';
import { parseConfigFromFile } from './config';

const config = parseConfigFromFile(
  process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
);

beforeEach(async (context: TestContext) => {
  const logger = new Logger({ level: config.logging.level });

  const { mongoClient, mongoDatabase } = await setupDatabase(
    config,
    generateTestDatabaseName(),
  );

  const eventBus = await setupEventBus(logger, config);

  const app = launchHttpServer(config, logger, mongoDatabase, eventBus);

  context.app = app;
  context.mongoClient = mongoClient;
  context.mongoDatabase = mongoDatabase;
});

afterEach(async ({ mongoClient, mongoDatabase, app }) => {
  await mongoDatabase.dropDatabase();
  await mongoClient.close();
  app.close();
});

function generateTestDatabaseName(): string {
  return `test_db_${faker.string.uuid()}`;
}

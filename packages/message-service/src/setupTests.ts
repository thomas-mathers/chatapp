import { faker } from '@faker-js/faker';
import { createJwt } from 'chatapp.crypto';
import { Logger } from 'chatapp.logging';
import { TestContext, afterEach, beforeEach } from 'vitest';

import { launchHttpServer, launchWebSocketServer, setupDatabase } from './app';
import { parseConfigFromFile } from './config';
import { Message } from './models/message';
import { MessageRepository } from './repositories/messageRepository';
import { MessageService } from './services/messageService';

const config = parseConfigFromFile(
  process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
);

beforeEach(async (context: TestContext) => {
  context.token = createJwt(
    {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
    },
    config.jwt,
  );

  const logger = new Logger({ level: config.logging.level });

  const { mongoClient, mongoDatabase } = await setupDatabase(
    config,
    generateTestDatabaseName(),
  );

  const messagesCollection = mongoDatabase.collection<Message>('messages');

  const messageRepository = new MessageRepository(messagesCollection);
  const messageService = new MessageService(messageRepository);

  const webSocketServer = launchWebSocketServer(logger, messageService);

  const app = launchHttpServer(config, logger, messageService, webSocketServer);

  context.app = app;
  context.mongoClient = mongoClient;
  context.mongoDatabase = mongoDatabase;
  context.webSocketServer = webSocketServer;
});

afterEach(async ({ mongoClient, mongoDatabase, app, webSocketServer }) => {
  await mongoDatabase.dropDatabase();
  await mongoClient.close();
  app.close();
  webSocketServer.close();
});

function generateTestDatabaseName(): string {
  return `test_db_${faker.string.uuid()}`;
}

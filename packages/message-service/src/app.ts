import bodyParser from 'body-parser';
import { Logger } from 'chatapp.logging';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import express from 'express';
import { Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { Config, parseConfigFromFile } from './config';
import { MessageController } from './controllers/messageController';
import { Message } from './models/message';
import { MessageRepository } from './repositories/messageRepository';
import { MessageService } from './services/messageService';

const swaggerDoc = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'Message Service',
      version: '1.0.0',
      description: 'Message Service API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['**/controllers/*.{ts,js}'],
});

export function launchHttpServer(
  config: Config,
  logger: Logger,
  mongoDatabase: Db,
): Server {
  const messagesCollection = mongoDatabase.collection<Message>('messages');

  const messageRepository = new MessageRepository(messagesCollection);
  const messageService = new MessageService(messageRepository);
  const messageController = new MessageController(messageService);

  return express()
    .use(bodyParser.json())
    .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
    .use(handleAuthMiddleware(config.jwt))
    .use('/messages', messageController.router)
    .use(handleErrorMiddleware)
    .listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
}

export async function setupDatabase(
  config: Config,
  databaseName: string | undefined = undefined,
): Promise<{
  mongoClient: MongoClient;
  mongoDatabase: Db;
}> {
  const mongoClient = new MongoClient(config.mongo.uri);
  await mongoClient.connect();

  const mongoDatabase = mongoClient.db(databaseName);

  const messagesCollection = mongoDatabase.collection<Message>('messages');

  await messagesCollection.createIndex({ accountId: 1 });
  await messagesCollection.createIndex({ accountUsername: 1 });
  await messagesCollection.createIndex({ dateCreated: 1 });

  return { mongoClient, mongoDatabase };
}

async function main() {
  const config = parseConfigFromFile(
    process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
  );

  const logger = new Logger({ level: config.logging.level });

  const { mongoDatabase } = await setupDatabase(config);

  return launchHttpServer(config, logger, mongoDatabase);
}

main();

import bodyParser from 'body-parser';
import { ChatAppLogger } from 'chatapp.logging';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import dotenv from 'dotenv';
import express from 'express';
import expressWs from 'express-ws';
import { MongoClient } from 'mongodb';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { configSchema } from './config';
import { MessageController } from './controllers/messageController';
import { RealtimeController } from './controllers/realtimeController';
import { Message } from './models/message';
import { MessageRepository } from './repositories/messageRepository';
import { MessageService } from './services/messageService';

async function main() {
  dotenv.config();

  const config = configSchema.parse(process.env);

  const logger = new ChatAppLogger();

  const databaseClient = new MongoClient(config.mongoUri);

  await databaseClient.connect();

  const messagesCollection = databaseClient
    .db()
    .collection<Message>('messages');

  messagesCollection.createIndex({ accountId: 1 });
  messagesCollection.createIndex({ accountUsername: 1 });
  messagesCollection.createIndex({ dateCreated: 1 });

  const messageRepository = new MessageRepository(messagesCollection);
  const messageService = new MessageService(messageRepository);
  const messageController = new MessageController(messageService);

  const expressWsInstance = expressWs(express());

  const realtimeController = new RealtimeController(
    messageService,
    expressWsInstance,
    logger,
  );

  expressWsInstance.app
    .use(bodyParser.json())
    .use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(
        swaggerJsdoc({
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
        }),
      ),
    )
    .use(handleAuthMiddleware(config.jwt))
    .use('/messages', messageController.router)
    .use('/realtime', realtimeController.router)
    .use(handleErrorMiddleware)
    .listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
}

main();

import bodyParser from 'body-parser';
import {
  CreateMessageRequest,
  createMessageRequestSchema,
} from 'chatapp.message-service-contracts';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import express from 'express';
import expressWs from 'express-ws';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import MessageController from './controllers/messageController';
import { databaseClient } from './databaseClient';
import { logger } from './logger';
import * as MessageService from './services/messageService';

const { app, getWss } = expressWs(express());

app.use(bodyParser.json());
app.use(
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
);
app.use(handleAuthMiddleware(config.jwt));
app.use('/messages', MessageController);
app.use(handleErrorMiddleware);

app.ws('/realtime', (ws, req) => {
  ws.on('close', () => {
    logger.info('Client disconnected', {
      accountId: req.accountId,
      accountUsername: req.accountUsername,
    });
  });

  ws.on('message', async (json: string) => {
    try {
      const createMessageRequest: CreateMessageRequest = JSON.parse(json);

      createMessageRequestSchema.parse(createMessageRequest);

      const message = await MessageService.createMessage(
        req.accountId,
        req.accountUsername,
        createMessageRequest.content,
      );

      getWss().clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    } catch (error) {
      logger.error('Error processing realtime message', {
        accountId: req.accountId,
        accountUsername: req.accountUsername,
        error: error,
      });
    }
  });

  logger.info('Client connected', {
    accountId: req.accountId,
    accountUsername: req.accountUsername,
  });
});

async function main() {
  try {
    await databaseClient.connect();

    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (e) {
    logger.error('Failed to start the server', e);
    await databaseClient.close();
  }
}

main();

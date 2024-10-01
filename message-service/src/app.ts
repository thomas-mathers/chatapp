import bodyParser from 'body-parser';
import {
  CreateMessageRequest,
  createMessageRequestSchema,
} from 'chatapp-message-service-contracts';
import { handleErrorMiddleware } from 'chatapp-middlewares';
import express from 'express';
import expressWs from 'express-ws';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import MessageController from './controllers/messageController';
import { databaseClient } from './databaseClient';
import env from './env';
import { handleAuthMiddleware } from './middlewares/handleAuthMiddleware';
import * as MessageService from './services/messageService';

const { app, getWss } = expressWs(express());

app.use(bodyParser.json());
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJsdoc({
      swaggerDefinition: {
        openapi: '3.0.0',
        info: { title: 'Message Service', version: '1.0.0' },
      },
      apis: ['**/controllers/*.{ts,js}'],
    }),
  ),
);
app.use(handleAuthMiddleware);
app.use('/messages', MessageController);
app.use(handleErrorMiddleware);

app.ws('/realtime', (ws, req) => {
  ws.on('message', async (json: string) => {
    try {
      const createMessageRequest: CreateMessageRequest = JSON.parse(json);

      const { success } =
        createMessageRequestSchema.safeParse(createMessageRequest);

      if (!success) {
        ws.send(JSON.stringify({ error: 'Invalid request' }));
        return;
      }

      const message = await MessageService.createMessage(
        req.accountId,
        req.accountUsername,
        createMessageRequest.content,
      );

      getWss().clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    } catch (error) {
      console.error('Error processing realtime message:', error);
    }
  });
});

async function main() {
  try {
    await databaseClient.connect();

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch {
    await databaseClient.close();
  }
}

main();

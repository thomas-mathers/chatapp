import bodyParser from 'body-parser';
import express from 'express';
import expressWs from 'express-ws';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import MessageController from './controllers/messageController';
import env from './env';
import handleAuthMiddleware from './middlewares/handleAuthMiddleware';
import { handleErrorMiddleware } from './middlewares/handleErrorMiddleware';
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
  ws.on('message', async (content: string) => {
    const message = await MessageService.createMessage(
      req.accountId,
      req.accountUsername,
      content,
    );
    getWss().clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  });
});

async function main() {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

main();

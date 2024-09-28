import bodyParser from 'body-parser';
import express from 'express';
import expressWs from 'express-ws';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import MessageController from './controllers/messageController';
import env from './env';
import authMiddleware from './middlewares/authMiddleware';
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
app.use(authMiddleware);
app.use('/messages', MessageController);

app.ws('/realtime', (ws, req) => {
  ws.on('message', (message: string) => {
    MessageService.createMessage(req.accountId as string, message);
    getWss().clients.forEach((client) => {
      client.send(message);
    });
  });
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

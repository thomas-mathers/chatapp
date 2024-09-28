import express from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import env from './env';
import jwtMiddleware from './middlewares/jwtMiddleware';
import * as MessageService from './services/messageService';
import MessageController from './controllers/messageController';

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
app.use(jwtMiddleware);
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

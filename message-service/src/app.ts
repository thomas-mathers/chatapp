import bodyParser from 'body-parser';
import express from 'express';
import expressWs from 'express-ws';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import MessageController from './controllers/messageController';
import { realtimeController } from './controllers/realtimeController';
import { databaseClient } from './databaseClient';
import env from './env';
import handleAuthMiddleware from './middlewares/handleAuthMiddleware';
import { handleErrorMiddleware } from './middlewares/handleErrorMiddleware';

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
app.use(realtimeController(getWss));

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

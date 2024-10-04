import bodyParser from 'body-parser';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import AccountController from './controllers/accountController';
import { close, connect } from './databaseClient';

const app = express()
  .use(bodyParser.json())
  .use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(
      swaggerJsdoc({
        swaggerDefinition: {
          openapi: '3.0.0',
          info: { title: 'Account Service', version: '1.0.0' },
        },
        apis: ['**/controllers/*.{ts,js}'],
      }),
    ),
  )
  .use('/accounts', AccountController)
  .use(handleErrorMiddleware);

async function main() {
  try {
    await connect();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch {
    await close();
  }
}

main();

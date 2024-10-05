import bodyParser from 'body-parser';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import AccountController from './controllers/accountController';
import AuthController from './controllers/authController';
import { close, connect } from './databaseClient';
import logger from './logger';

const app = express()
  .use(bodyParser.json())
  .use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(
      swaggerJsdoc({
        swaggerDefinition: {
          openapi: '3.0.1',
          info: {
            title: 'Account Service',
            version: '1.0.0',
            description: 'Account Service API',
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
  .use('/accounts', AccountController)
  .use('/auth', AuthController)
  .use(handleErrorMiddleware);

async function main() {
  try {
    await connect();

    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (e) {
    logger.error('Failed to start the server', e);
    await close();
  }
}

main();

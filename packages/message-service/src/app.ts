import bodyParser from 'body-parser';
import {
  handleAuthMiddleware,
  handleErrorMiddleware,
} from 'chatapp.middlewares';
import express, { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { Services, setupServices } from './setupServices';

export function run({
  config,
  logger,
  messageController,
}: Services): Application {
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
    .use(handleErrorMiddleware);

  app.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`);
  });

  return app;
}

async function main() {
  const services = await setupServices();
  run(services);
}

main();

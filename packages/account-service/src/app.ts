import bodyParser from 'body-parser';
import { handleErrorMiddleware } from 'chatapp.middlewares';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { Services, setupServices } from './setupServices';

export function run({
  accountController,
  authController,
  config,
  logger,
}: Services) {
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
    .use('/accounts', accountController.router)
    .use('/auth', authController.router)
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

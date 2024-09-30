import bodyParser from 'body-parser';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { AccountController, AuthController } from './controllers';
import { client } from './databaseClient';
import env from './env';
import { handleErrorMiddleware } from './middlewares/handleErrorMiddleware';

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
  .use('/auth', AuthController)
  .use(handleErrorMiddleware);

async function main() {
  try {
    await client.connect();
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch {
    await client.close();
  }
}

main();

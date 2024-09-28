import bodyParser from 'body-parser';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { AccountController, AuthController } from './controllers';
import env from './env';

const app = express();

app.use(bodyParser.json());

app.use(
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
);
app.use('/accounts', AccountController);
app.use('/auth', AuthController);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

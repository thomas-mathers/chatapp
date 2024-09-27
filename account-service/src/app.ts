import express from 'express';
import bodyParser from 'body-parser';
import env from '../env';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { AccountController, AuthController } from './controllers';

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
      apis: ['src/controllers/*.{ts,js}'],
    }),
  ),
);
app.use('/accounts', AccountController);
app.use('/auth', AuthController);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import env from '../env';
import AccountRepository from './repositories/accountRepository';
import AuthService from './services/authService';
import AccountService from './services/accountService';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);

const authService = new AuthService(accountService);

const app = express();

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
      apis: ['src/**/*.ts'],
    }),
  ),
);

/**
 * @openapi
 * /accounts:
 *   post:
 *     description: Creates a new account.
 *     responses:
 *       201:
 *         description: Returns the new account.
 */
app.post('/accounts', (req: Request, res: Response) => {
  const { statusCode, data } = accountService.createAccount(req.body);
  res.status(statusCode).json(data);
});

/**
 * @openapi
 * /accounts:
 *   get:
 *     description: Gets the list of accounts.
 *     responses:
 *       200:
 *         description: Returns the list of accounts.
 */
app.get('/accounts', (req: Request, res: Response) => {
  const { statusCode, data } = accountService.getAccounts();
  res.status(statusCode).json(data);
});

/**
 * @openapi
 * /auth/login:
 *   get:
 *     description: Log in.
 *     responses:
 *       200:
 *         description: Returns a JWT.
 */
app.post('/auth/login', (req: Request, res: Response) => {
  const { statusCode, data } = authService.login(req.body);
  res.status(statusCode).json(data);
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

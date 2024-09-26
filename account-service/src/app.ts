import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import env from '../env';
import AccountRepository from './repositories/accountRepository';
import AuthService from './services/authService';
import AccountService from './services/accountService';

const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);

const authService = new AuthService(accountService);

const app = express();

app.use(bodyParser.json());

app.post('/accounts', (req: Request, res: Response) => {
  const { statusCode, data } = accountService.createAccount(req.body);
  res.status(statusCode).json(data);
});

app.get('/accounts', (req: Request, res: Response) => {
  const { statusCode, data } = accountService.getAccounts();
  res.status(statusCode).json(data);
});

app.post('/auth/login', (req: Request, res: Response) => {
  const { statusCode, data } = authService.login(req.body);
  res.status(statusCode).json(data);
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

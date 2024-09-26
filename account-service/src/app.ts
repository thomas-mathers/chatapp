import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import AccountRepository from './repositories/accountRepository';
import AuthService from './services/authService';
import AccountService from './services/accountService';

dotenv.config();

const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);
const authService = new AuthService(accountService, process.env.JWT_SECRET);

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

import { Request, Response, Router } from 'express';

import * as AccountService from '../services/accountService';

const router = Router();

/**
 * @openapi
 * /accounts:
 *   post:
 *     description: Creates a new account.
 *     responses:
 *       201:
 *         description: Returns the new account.
 */
router.post('/', (req: Request, res: Response) => {
  const { statusCode, data } = AccountService.createAccount(req.body);
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
router.get('/', (req: Request, res: Response) => {
  const { statusCode, data } = AccountService.getAccounts();
  res.status(statusCode).json(data);
});

export default router;

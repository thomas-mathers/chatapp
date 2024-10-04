import {
  changePasswordRequestSchema,
  createAccountRequestSchema,
  getAccountsRequestSchema,
  loginRequestSchema,
} from 'chatapp.account-service-contracts';
import {
  handleAuthMiddleware,
  handleRequestBodyValidationMiddleware,
  handleRequestQueryValidationMiddleware,
} from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';

import env from '../config';
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
router.post(
  '/',
  handleRequestBodyValidationMiddleware(createAccountRequestSchema),
  async (req: Request, res: Response) => {
    const { statusCode, data } = await AccountService.createAccount(req.body);
    res.status(statusCode).json(data);
  },
);

/**
 * @openapi
 * /accounts/login:
 *   get:
 *     description: Log in.
 *     responses:
 *       200:
 *         description: Returns a JWT.
 */
router.post(
  '/login',
  handleRequestBodyValidationMiddleware(loginRequestSchema),
  async (req: Request, res: Response) => {
    const { statusCode, data } = await AccountService.login(req.body);
    res.status(statusCode).json(data);
  },
);

/**
 * @openapi
 * /accounts/{accountId}/password:
 *   put:
 *     description: Changes pasword.
 */
router.post(
  '/:accountId/password',
  handleRequestBodyValidationMiddleware(changePasswordRequestSchema),
  async (req: Request, res: Response) => {
    await AccountService.changePassword(req.params.accountId, req.body);
    res.status(200);
  },
);

/**
 * @openapi
 * /accounts:
 *   get:
 *     description: Gets the list of accounts.
 *     responses:
 *       200:
 *         description: Returns the list of accounts.
 */
router.get(
  '/',
  handleAuthMiddleware(env.jwt),
  handleRequestQueryValidationMiddleware(getAccountsRequestSchema),
  async (req: Request, res: Response) => {
    const getAccountsRequest = getAccountsRequestSchema.parse(req.query);
    const page = await AccountService.getAccounts(getAccountsRequest);
    res.status(200).json(page);
  },
);

/**
 * @openapi
 * /accounts/{accountId}:
 *   delete:
 *     description: Deletes an account.
 */
router.delete(
  '/:accountId',
  handleAuthMiddleware(env.jwt),
  async (req: Request, res: Response) => {
    const { statusCode, data } = await AccountService.deleteAccount(
      req.params.accountId,
    );
    res.status(statusCode).json(data);
  },
);

export default router;

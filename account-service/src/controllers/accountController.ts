import { createAccountRequestSchema } from 'chatapp.account-service-contracts';
import {
  handleAuthMiddleware,
  handleRequestBodyValidationMiddleware,
} from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';

import { Config } from '../config';
import { AccountService } from '../services/accountService';

export class AccountController {
  private _router: Router = Router();

  constructor(
    readonly config: Config,
    readonly accountService: AccountService,
  ) {
    /**
     * @swagger
     * /accounts:
     *   post:
     *     summary: Create a new account
     *     tags: [Account]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 example: "john_doe"
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john.doe@example.com"
     *               password:
     *                 type: string
     *                 example: "yourpassword"
     *     responses:
     *       201:
     *         description: Account created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   example: "12345"
     *                 username:
     *                   type: string
     *                   example: "john_doe"
     *                 email:
     *                   type: string
     *                   format: email
     *                   example: "john.doe@example.com"
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   example: "2023-01-01T00:00:00.000Z"
     *                 updatedAt:
     *                   type: string
     *                   format: date-time
     *                   example: "2023-01-02T00:00:00.000Z"
     *       400:
     *         description: Invalid request body
     *       500:
     *         description: Internal server error
     */
    this._router.post(
      '/',
      handleRequestBodyValidationMiddleware(createAccountRequestSchema),
      async (req: Request, res: Response) => {
        const { statusCode, data } = await accountService.createAccount(
          req.body,
        );
        res.status(statusCode).json(data);
      },
    );

    /**
     * @swagger
     * /accounts/me:
     *   get:
     *     summary: Get account details
     *     tags: [Account]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Account details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   example: "12345"
     *                 username:
     *                   type: string
     *                   example: "john_doe"
     *                 email:
     *                   type: string
     *                   format: email
     *                   example: "john.doe@example.com"
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   example: "2023-01-01T00:00:00.000Z"
     *                 updatedAt:
     *                   type: string
     *                   format: date-time
     *                   example: "2023-01-02T00:00:00.000Z"
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Account not found
     *       500:
     *         description: Internal server error
     */
    this._router.get(
      '/me',
      handleAuthMiddleware(config.jwt),
      async (req: Request, res: Response) => {
        const { statusCode, data } = await accountService.getAccountById(
          req.accountId,
        );
        res.status(statusCode).json(data);
      },
    );

    /**
     * @swagger
     * /accounts/me:
     *   delete:
     *     summary: Delete account
     *     tags: [Account]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Account deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Account deleted successfully"
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Account not found
     *       500:
     *         description: Internal server error
     */
    this._router.delete(
      '/me',
      handleAuthMiddleware(config.jwt),
      async (req: Request, res: Response) => {
        const { statusCode } = await accountService.deleteAccount(
          req.accountId,
        );
        res.status(statusCode).json();
      },
    );
  }

  get router(): Router {
    return this._router;
  }
}

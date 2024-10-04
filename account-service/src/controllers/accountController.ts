import { createAccountRequestSchema } from 'chatapp.account-service-contracts';
import {
  handleAuthMiddleware,
  handleRequestBodyValidationMiddleware,
} from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';

import config from '../config';
import * as AccountService from '../services/accountService';

const router = Router();

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
router.post(
  '/',
  handleRequestBodyValidationMiddleware(createAccountRequestSchema),
  async (req: Request, res: Response) => {
    const { statusCode, data } = await AccountService.createAccount(req.body);
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
router.get(
  '/me',
  handleAuthMiddleware(config.jwt),
  async (req: Request, res: Response) => {
    const { statusCode, data } = await AccountService.getAccountById(
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
router.delete(
  '/me',
  handleAuthMiddleware(config.jwt),
  async (req: Request, res: Response) => {
    const { statusCode } = await AccountService.deleteAccount(req.accountId);
    res.status(statusCode).json();
  },
);

export default router;

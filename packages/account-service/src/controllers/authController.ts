import {
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetRequest,
  PasswordResetTokenRequest,
  changePasswordRequestSchema,
  confirmEmailRequestSchema,
  loginRequestSchema,
  passwordResetRequestSchema,
  passwordResetTokenRequestSchema,
} from 'chatapp.account-service-contracts';
import {
  handleAuthMiddleware,
  handleRequestBodyValidationMiddleware,
} from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';

import { Config } from '../config';
import { AuthService } from '../services/authService';

export class AuthController {
  private _router = Router();

  constructor(
    readonly config: Config,
    readonly authService: AuthService,
  ) {
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Log in to the account
     *     tags: [Auth]
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
     *               password:
     *                 type: string
     *                 example: "yourpassword"
     *     responses:
     *       200:
     *         description: Returns a JWT token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   example: "jwt-token"
     *       400:
     *         description: Invalid request
     *       401:
     *         description: Unauthorized
     */
    this._router.post(
      '/login',
      handleRequestBodyValidationMiddleware(loginRequestSchema),
      async (req: Request, res: Response) => {
        const body: LoginRequest = req.body;
        const result = await authService.login(body.username, body.password);
        res.status(result.statusCode).json(result);
      },
    );

    /**
     * @swagger
     * /auth/me/password:
     *   put:
     *     summary: Change the password of the logged-in user
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               oldPassword:
     *                 type: string
     *                 example: "currentpassword"
     *               newPassword:
     *                 type: string
     *                 example: "newpassword"
     *     responses:
     *       200:
     *         description: Password changed successfully
     *       400:
     *         description: Invalid request
     *       401:
     *         description: Unauthorized
     */
    this._router.put(
      '/me/password',
      handleAuthMiddleware(config.jwt),
      handleRequestBodyValidationMiddleware(changePasswordRequestSchema),
      async (req: Request, res: Response) => {
        const body: ChangePasswordRequest = req.body;
        const result = await authService.changePassword(
          req.accountId,
          body.oldPassword,
          body.newPassword,
        );
        res.status(result.statusCode).json(result);
      },
    );

    /**
     * @swagger
     * /auth/password-reset-requests:
     *   post:
     *     summary: Create a password reset token and send it to the user's email
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "user@example.com"
     *     responses:
     *       200:
     *         description: Password reset token created and sent to email
     *       400:
     *         description: Invalid request
     *       404:
     *         description: User not found
     */
    this._router.post(
      '/password-reset-requests',
      handleRequestBodyValidationMiddleware(passwordResetTokenRequestSchema),
      async (req: Request, res: Response) => {
        const body: PasswordResetTokenRequest = req.body;
        const result = await authService.resetPasswordRequest(body.email);
        res.status(result.statusCode).json(result);
      },
    );

    /**
     * @swagger
     * /auth/password-resets:
     *   post:
     *     summary: Update the user's password using a password reset token
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *                 example: "reset-token"
     *               newPassword:
     *                 type: string
     *                 example: "newpassword"
     *     responses:
     *       200:
     *         description: Password updated successfully
     *       400:
     *         description: Invalid request
     *       404:
     *         description: Invalid or expired token
     */
    this._router.post(
      '/password-resets',
      handleRequestBodyValidationMiddleware(passwordResetRequestSchema),
      async (req: Request, res: Response) => {
        const body: PasswordResetRequest = req.body;
        const result = await authService.resetPassword(
          body.token,
          body.newPassword,
        );
        res.status(result.statusCode).json(result);
      },
    );

    this._router.post(
      '/email-confirmations',
      handleRequestBodyValidationMiddleware(confirmEmailRequestSchema),
      async (req: Request, res: Response) => {
        const result = await authService.confirmEmail(req.body.token);
        res.status(result.statusCode).json(result);
      },
    );
  }

  get router(): Router {
    return this._router;
  }
}

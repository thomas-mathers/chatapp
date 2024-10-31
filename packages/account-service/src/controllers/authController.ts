import {
  AccountServiceErrorCode,
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetRequest,
  PasswordResetTokenRequest,
  changePasswordRequestSchema,
  confirmEmailRequestSchema,
  createAccountServiceError,
  loginRequestSchema,
  passwordResetRequestSchema,
  passwordResetTokenRequestSchema,
} from 'chatapp.account-service-contracts';
import {
  handleAuthMiddleware,
  handleRequestBodyValidationMiddleware,
} from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Result } from 'typescript-result';

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
        Result.fromAsync(authService.login(body.username, body.password)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => {
            switch (error) {
              case AccountServiceErrorCode.IncorrectPassword:
                res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.IncorrectPassword,
                    ),
                  );
                break;
              case AccountServiceErrorCode.EmailNotVerified:
                res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.EmailNotVerified,
                    ),
                  );
                break;
              case AccountServiceErrorCode.AccountNotFound:
                res
                  .status(StatusCodes.NOT_FOUND)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.AccountNotFound,
                    ),
                  );
                break;
              default:
                res
                  .status(500)
                  .json(
                    createAccountServiceError(AccountServiceErrorCode.Unknown),
                  );
            }
          },
        );
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
        Result.fromAsync(
          authService.changePassword(
            req.accountId,
            body.oldPassword,
            body.newPassword,
          ),
        ).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => {
            switch (error) {
              case AccountServiceErrorCode.IncorrectPassword:
                res
                  .status(StatusCodes.UNAUTHORIZED)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.IncorrectPassword,
                    ),
                  );
                break;
              case AccountServiceErrorCode.AccountNotFound:
                res
                  .status(StatusCodes.NOT_FOUND)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.AccountNotFound,
                    ),
                  );
                break;
              default:
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json(
                    createAccountServiceError(AccountServiceErrorCode.Unknown),
                  );
            }
          },
        );
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
        Result.fromAsync(authService.resetPasswordRequest(body.email)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => {
            switch (error) {
              case AccountServiceErrorCode.AccountNotFound:
                res
                  .status(StatusCodes.NOT_FOUND)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.AccountNotFound,
                    ),
                  );
                break;
              default:
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json(
                    createAccountServiceError(AccountServiceErrorCode.Unknown),
                  );
            }
          },
        );
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
        Result.fromAsync(
          authService.resetPassword(body.token, body.newPassword),
        ).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => {
            switch (error) {
              case AccountServiceErrorCode.InvalidToken:
                res
                  .status(StatusCodes.FORBIDDEN)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.InvalidToken,
                    ),
                  );
                break;
              case AccountServiceErrorCode.AccountNotFound:
                res
                  .status(StatusCodes.NOT_FOUND)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.AccountNotFound,
                    ),
                  );
                break;
              default:
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json(
                    createAccountServiceError(AccountServiceErrorCode.Unknown),
                  );
            }
          },
        );
      },
    );

    this._router.post(
      '/email-confirmations',
      handleRequestBodyValidationMiddleware(confirmEmailRequestSchema),
      async (req: Request, res: Response) => {
        Result.fromAsync(authService.confirmEmail(req.body.token)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => {
            switch (error) {
              case AccountServiceErrorCode.InvalidToken:
                res
                  .status(StatusCodes.FORBIDDEN)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.InvalidToken,
                    ),
                  );
                break;
              case AccountServiceErrorCode.AccountNotFound:
                res
                  .status(StatusCodes.NOT_FOUND)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.AccountNotFound,
                    ),
                  );
                break;
              default:
                res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json(
                    createAccountServiceError(AccountServiceErrorCode.Unknown),
                  );
            }
          },
        );
      },
    );
  }

  get router(): Router {
    return this._router;
  }
}

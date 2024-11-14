import {
  ChangePasswordRequest,
  ExchangeAuthCodeRequest,
  LoginRequest,
  PasswordResetRequest,
  PasswordResetTokenRequest,
  changePasswordRequestSchema,
  confirmEmailRequestSchema,
  exchangeAuthCodeRequestSchema,
  loginRequestSchema,
  passwordResetRequestSchema,
  passwordResetTokenRequestSchema,
} from 'chatapp.account-service-contracts';
import {
  handleJwtAuthMiddleware,
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
    this._router.post(
      '/login',
      handleRequestBodyValidationMiddleware(loginRequestSchema),
      async (req: Request, res: Response) => {
        const body: LoginRequest = req.body;
        Result.fromAsync(authService.login(body.username, body.password)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.put(
      '/me/password',
      handleJwtAuthMiddleware(config.jwt),
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
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.post(
      '/password-reset-requests',
      handleRequestBodyValidationMiddleware(passwordResetTokenRequestSchema),
      async (req: Request, res: Response) => {
        const body: PasswordResetTokenRequest = req.body;
        Result.fromAsync(authService.resetPasswordRequest(body.email)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.post(
      '/password-resets',
      handleRequestBodyValidationMiddleware(passwordResetRequestSchema),
      async (req: Request, res: Response) => {
        const body: PasswordResetRequest = req.body;
        Result.fromAsync(
          authService.resetPassword(body.token, body.newPassword),
        ).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.post(
      '/email-confirmations',
      handleRequestBodyValidationMiddleware(confirmEmailRequestSchema),
      async (req: Request, res: Response) => {
        Result.fromAsync(authService.confirmEmail(req.body.token)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.post(
      '/auth-codes',
      handleRequestBodyValidationMiddleware(exchangeAuthCodeRequestSchema),
      async (req: Request, res: Response) => {
        const exchangeAuthCodeRequest = req.body as ExchangeAuthCodeRequest;
        Result.fromAsync(
          authService.exchangeAuthCodeForToken(exchangeAuthCodeRequest.code),
        ).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );
  }

  get router(): Router {
    return this._router;
  }
}

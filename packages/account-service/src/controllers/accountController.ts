import {
  AccountRegistrationRequest,
  accountRegistrationRequest,
  getAccountsRequestSchema,
} from 'chatapp.account-service-contracts';
import {
  handleAuthMiddleware,
  handleRequestBodyValidationMiddleware,
  handleRequestQueryValidationMiddleware,
} from 'chatapp.middlewares';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Result } from 'typescript-result';

import { Config } from '../config';
import { AccountService } from '../services/accountService';

export class AccountController {
  private _router: Router = Router();

  constructor(
    readonly config: Config,
    readonly accountService: AccountService,
  ) {
    this._router.get(
      '/',
      handleAuthMiddleware(config.jwt),
      handleRequestQueryValidationMiddleware(getAccountsRequestSchema),
      async (req: Request, res: Response) => {
        const getAccountsRequest = getAccountsRequestSchema.parse(req.query);
        const result = await accountService.getPage(getAccountsRequest);
        res.status(StatusCodes.OK).json(result);
      },
    );

    this._router.post(
      '/',
      handleRequestBodyValidationMiddleware(accountRegistrationRequest),
      async (req: Request, res: Response) => {
        const { username, password, email }: AccountRegistrationRequest =
          req.body;
        Result.fromAsync(
          accountService.create(username, password, email, false),
        ).fold(
          (result) => res.status(201).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.get(
      '/me',
      handleAuthMiddleware(config.jwt),
      async (req: Request, res: Response) => {
        Result.fromAsync(accountService.getById(req.accountId)).fold(
          (result) => res.status(StatusCodes.OK).json(result),
          (error) => res.status(error.statusCode).json(error),
        );
      },
    );

    this._router.delete(
      '/me',
      handleAuthMiddleware(config.jwt),
      async (req: Request, res: Response) => {
        Result.fromAsync(accountService.deleteById(req.accountId)).fold(
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

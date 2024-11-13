import {
  AccountRegistrationRequest,
  accountRegistrationRequest,
  getAccountsRequestSchema,
} from 'chatapp.account-service-contracts';
import { FileStorageService } from 'chatapp.api-clients';
import { ApiError, ApiErrorCode } from 'chatapp.api-error';
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
    readonly fileStorageService: FileStorageService,
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
          accountService.insert({
            username,
            password,
            email,
            emailVerified: false,
            profilePictureUrl: null,
            oauthProviderAccountIds: {},
            dateCreated: new Date(),
          }),
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
        const account = await accountService.getById(req.accountId);
        if (!account) {
          res.status(StatusCodes.NOT_FOUND).json(
            ApiError.fromErrorCode({
              code: ApiErrorCode.AccountNotFound,
            }),
          );
        } else {
          res.status(StatusCodes.OK).json(account);
        }
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

    this._router.put(
      '/me/profile-picture',
      handleAuthMiddleware(config.jwt),
      async (req: Request, res: Response) => {
        const { mimetype, buffer } = req.file!;

        const blob = new Blob([buffer], { type: mimetype });

        const { url } = await fileStorageService.upload(
          req.accountId,
          'profile-picture.png',
          blob,
        );

        await accountService.patch(req.accountId, {
          profilePictureUrl: url,
        });

        res.status(201).json();
      },
    );
  }

  get router(): Router {
    return this._router;
  }
}

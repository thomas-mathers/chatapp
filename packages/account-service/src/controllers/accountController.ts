import {
  AccountRegistrationRequest,
  AccountServiceErrorCode,
  accountRegistrationRequest,
  createAccountServiceError,
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
      handleRequestBodyValidationMiddleware(accountRegistrationRequest),
      async (req: Request, res: Response) => {
        const { username, password, email }: AccountRegistrationRequest =
          req.body;
        Result.fromAsync(
          accountService.register(username, password, email, false),
        ).fold(
          (result) => res.status(201).json(result),
          (error) => {
            switch (error) {
              case AccountServiceErrorCode.UsernameExists:
                res
                  .status(StatusCodes.CONFLICT)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.UsernameExists,
                    ),
                  );
                break;
              case AccountServiceErrorCode.EmailExists:
                res
                  .status(StatusCodes.CONFLICT)
                  .json(
                    createAccountServiceError(
                      AccountServiceErrorCode.EmailExists,
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
        Result.fromAsync(accountService.getById(req.accountId)).fold(
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
        Result.fromAsync(accountService.deleteById(req.accountId)).fold(
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
  }

  get router(): Router {
    return this._router;
  }
}

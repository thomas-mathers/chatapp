import {
  AccountSummary,
  LoginResponse,
} from 'chatapp.account-service-contracts';
import { ApiError, ApiErrorCode } from 'chatapp.api-error';
import { createHash, createJwt, verifyHash, verifyJwt } from 'chatapp.crypto';
import { EventBus, EventName } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { Result } from 'typescript-result';

import { Config } from '../config';
import { AccountRepository, AuthCodeRepository } from '../repositories';

export class AuthService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
    private readonly eventBus: EventBus,
    private readonly authCodeRepository: AuthCodeRepository,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<Result<LoginResponse, ApiError>> {
    const account = await this.accountRepository.getByUsername(username);

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    if (!account.emailVerified) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.EmailNotVerified }),
      );
    }

    const isPasswordCorrect = await verifyHash(password, account.password);

    if (!isPasswordCorrect) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.IncorrectPassword }),
      );
    }

    const accessToken = createJwt(
      { userId: account._id!.toString(), username: account.username },
      this.config.jwt,
    );

    this.logger.info('User logged in', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok({ accessToken });
  }

  async linkAuthCodeToJwt(
    code: string,
    { id, username, email }: AccountSummary,
  ): Promise<string> {
    const jwt = createJwt({ userId: id, username }, this.config.jwt);

    await this.authCodeRepository.insert(code, jwt);

    this.logger.info('Auth code generated', {
      id,
      username,
      email,
    });

    return code;
  }

  async exchangeAuthCodeForToken(
    authCode: string,
  ): Promise<Result<LoginResponse, ApiError>> {
    const accessToken = await this.authCodeRepository.get(authCode);

    if (!accessToken) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.InvalidAuthCode }),
      );
    }

    await this.authCodeRepository.delete(authCode);

    return Result.ok({ accessToken });
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<Result<void, ApiError>> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    const isOldPasswordCorrect = await verifyHash(
      oldPassword,
      account.password,
    );

    if (!isOldPasswordCorrect) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.IncorrectPassword }),
      );
    }

    const password = await createHash(newPassword);

    await this.accountRepository.update({ ...account, password });

    this.logger.info('User password changed', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok();
  }

  async resetPasswordRequest(email: string): Promise<Result<void, ApiError>> {
    const account = await this.accountRepository.getByEmail(email);

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    const token = createJwt(
      { userId: account._id!.toString(), username: account.username },
      this.config.jwt,
    );

    this.eventBus.produce({
      name: EventName.REQUEST_RESET_PASSWORD,
      accountId: account._id!.toString(),
      accountName: account.username,
      accountEmail: account.email,
      token,
    });

    this.logger.info('User password reset requested', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok();
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<Result<void, ApiError>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.InvalidToken }),
      );
    }

    const account = await this.accountRepository.getById(
      userCredentials.userId,
    );

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    const password = await createHash(newPassword);

    await this.accountRepository.update({ ...account, password });

    this.logger.info('User password reset', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok();
  }

  async confirmEmail(token: string): Promise<Result<void, ApiError>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.InvalidToken }),
      );
    }

    const account = await this.accountRepository.getById(
      userCredentials.userId,
    );

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    await this.accountRepository.update({
      ...account,
      emailVerified: true,
    });

    this.logger.info('User email confirmed', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok();
  }
}

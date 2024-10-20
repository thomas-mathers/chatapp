import { LoginResponse } from 'chatapp.account-service-contracts';
import {
  ApiResult,
  ErrorCode,
  notFound,
  ok,
  unauthorized,
} from 'chatapp.api-result';
import { createHash, createJwt, verifyHash, verifyJwt } from 'chatapp.crypto';
import { EventBus, EventName } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';

import { Config } from '../config';
import { AccountRepository } from '../repositories/accountRepository';

export class AuthService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<ApiResult<LoginResponse>> {
    const account = await this.accountRepository.getAccountByUsername(username);

    if (!account) {
      return notFound(ErrorCode.AccountNotFound);
    }

    if (!account.emailVerified) {
      return unauthorized(ErrorCode.EmailNotVerified);
    }

    const isPasswordCorrect = await verifyHash(password, account.password);

    if (!isPasswordCorrect) {
      return unauthorized(ErrorCode.IncorrectPassword);
    }

    const jwt = createJwt(
      { userId: account._id!.toString(), username: account.username },
      this.config.jwt,
    );

    this.logger.info('User logged in', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return ok({ jwt });
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResult<void>> {
    const account = await this.accountRepository.getAccountById(id);

    if (!account) {
      return notFound(ErrorCode.AccountNotFound);
    }

    const isOldPasswordCorrect = await verifyHash(
      oldPassword,
      account.password,
    );

    if (!isOldPasswordCorrect) {
      return unauthorized(ErrorCode.IncorrectPassword);
    }

    const password = await createHash(newPassword);

    await this.accountRepository.updateAccount({ ...account, password });

    this.logger.info('User password changed', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return ok();
  }

  async resetPasswordRequest(email: string): Promise<ApiResult<void>> {
    const account = await this.accountRepository.getAccountByEmail(email);

    if (!account) {
      return notFound(ErrorCode.AccountNotFound);
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

    return ok();
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResult<void>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return unauthorized(ErrorCode.InvalidToken);
    }

    const account = await this.accountRepository.getAccountById(
      userCredentials.userId,
    );

    if (!account) {
      return notFound(ErrorCode.AccountNotFound);
    }

    const password = await createHash(newPassword);

    await this.accountRepository.updateAccount({ ...account, password });

    this.logger.info('User password reset', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return ok();
  }

  async confirmEmail(token: string): Promise<ApiResult<void>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return unauthorized(ErrorCode.InvalidToken);
    }

    const account = await this.accountRepository.getAccountById(
      userCredentials.userId,
    );

    if (!account) {
      return notFound(ErrorCode.AccountNotFound);
    }

    await this.accountRepository.updateAccount({
      ...account,
      emailVerified: true,
    });

    this.logger.info('User email confirmed', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return ok();
  }
}

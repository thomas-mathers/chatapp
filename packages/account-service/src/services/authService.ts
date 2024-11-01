import {
  AccountServiceErrorCode,
  LoginResponse,
} from 'chatapp.account-service-contracts';
import { createHash, createJwt, verifyHash, verifyJwt } from 'chatapp.crypto';
import { EventBus, EventName } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { Result } from 'typescript-result';

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
  ): Promise<Result<LoginResponse, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getByUsername(username);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    if (!account.emailVerified) {
      return Result.error(AccountServiceErrorCode.EmailNotVerified);
    }

    const isPasswordCorrect = await verifyHash(password, account.password);

    if (!isPasswordCorrect) {
      return Result.error(AccountServiceErrorCode.IncorrectPassword);
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

    return Result.ok({ jwt });
  }

  async socialLogin(
    id: string,
  ): Promise<Result<LoginResponse, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    if (!account.emailVerified) {
      return Result.error(AccountServiceErrorCode.EmailNotVerified);
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

    return Result.ok({ jwt });
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<Result<void, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    const isOldPasswordCorrect = await verifyHash(
      oldPassword,
      account.password,
    );

    if (!isOldPasswordCorrect) {
      return Result.error(AccountServiceErrorCode.IncorrectPassword);
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

  async resetPasswordRequest(
    email: string,
  ): Promise<Result<void, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getByEmail(email);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
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
  ): Promise<Result<void, AccountServiceErrorCode>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return Result.error(AccountServiceErrorCode.InvalidToken);
    }

    const account = await this.accountRepository.getById(
      userCredentials.userId,
    );

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
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

  async confirmEmail(
    token: string,
  ): Promise<Result<void, AccountServiceErrorCode>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return Result.error(AccountServiceErrorCode.InvalidToken);
    }

    const account = await this.accountRepository.getById(
      userCredentials.userId,
    );

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
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

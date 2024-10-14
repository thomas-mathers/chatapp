import { LoginResponse } from 'chatapp.account-service-contracts';
import { createHash, createJwt, verifyHash, verifyJwt } from 'chatapp.crypto';
import { EventBus, EventName } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { StatusCodes } from 'http-status-codes';

import { Config } from '../config';
import { AccountRepository } from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';

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
  ): Promise<Result<LoginResponse>> {
    const account = await this.accountRepository.getAccountByUsername(username);

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
    }

    if (!account.emailVerified) {
      return failure(StatusCodes.UNAUTHORIZED);
    }

    const isPasswordCorrect = await verifyHash(password, account.password);

    if (!isPasswordCorrect) {
      return failure(StatusCodes.UNAUTHORIZED);
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

    return success({ jwt }, StatusCodes.OK);
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<Result<void>> {
    const account = await this.accountRepository.getAccountById(id);

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
    }

    const isOldPasswordCorrect = await verifyHash(
      oldPassword,
      account.password,
    );

    if (!isOldPasswordCorrect) {
      return failure(StatusCodes.UNAUTHORIZED);
    }

    const password = await createHash(newPassword);

    await this.accountRepository.updateAccount({ ...account, password });

    this.logger.info('User password changed', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return success();
  }

  async resetPasswordRequest(email: string): Promise<Result<void>> {
    const account = await this.accountRepository.getAccountByEmail(email);

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
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

    return success();
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<Result<void>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return failure(StatusCodes.UNAUTHORIZED);
    }

    const account = await this.accountRepository.getAccountById(
      userCredentials.userId,
    );

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
    }

    const password = await createHash(newPassword);

    await this.accountRepository.updateAccount({ ...account, password });

    this.logger.info('User password reset', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return success();
  }

  async confirmEmail(token: string): Promise<Result<void>> {
    const userCredentials = verifyJwt(token, this.config.jwt);

    if (userCredentials === undefined) {
      return failure(StatusCodes.UNAUTHORIZED);
    }

    const account = await this.accountRepository.getAccountById(
      userCredentials.userId,
    );

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
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

    return success();
  }
}

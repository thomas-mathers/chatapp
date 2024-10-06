import { LoginResponse } from 'chatapp.account-service-contracts';
import { createHash, createJwt, verifyHash, verifyJwt } from 'chatapp.crypto';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

import { EventName } from '../../../events/src/events';
import { Config } from '../config';
import { AccountRepository } from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';
import { EventProducerService } from './eventProducerService';

export class AuthService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
    private readonly eventProducerService: EventProducerService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<Result<LoginResponse>> {
    const account = await this.accountRepository.getAccountByUsername(username);

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
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

    return success({ jwt });
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

    this.logger.info('Password reset token generated', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    this.eventProducerService.produce({
      name: EventName.REQUEST_RESET_PASSWORD,
      payload: {
        accountId: account._id!.toString(),
        accountName: account.username,
        accountEmail: account.email,
        token,
      },
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
}

import {
  AccountSummary,
  CreateAccountRequest,
} from 'chatapp.account-service-contracts';
import { createHash } from 'chatapp.crypto';
import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';
import { Logger } from 'winston';

import { Account } from '../models/account';
import { AccountRepository } from '../repositories/accountRepository';
import { Result, failure, success } from '../statusCodeResult';

export class AccountService {
  constructor(
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
  ) {}

  async createAccount(
    request: CreateAccountRequest,
  ): Promise<Result<AccountSummary>> {
    try {
      const hash = await createHash(request.password);

      const account = await this.accountRepository.createAccount({
        username: request.username,
        password: hash,
        email: request.email,
        emailVerified: false,
        createdAt: new Date(),
      });

      const accountSummary = toAccountSummary(account);

      this.logger.info('Account created', {
        id: account._id,
        username: account.username,
        email: account.email,
      });

      return success(accountSummary, 201);
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        return failure(StatusCodes.CONFLICT);
      }
      throw error;
    }
  }

  async getAccountById(id: string): Promise<Result<AccountSummary>> {
    const account = await this.accountRepository.getAccountById(id);

    if (!account) {
      return failure(StatusCodes.NOT_FOUND);
    }

    const accountSummary = toAccountSummary(account);

    return success(accountSummary);
  }

  async deleteAccount(id: string): Promise<Result<void>> {
    const numDeleted = await this.accountRepository.deleteAccountById(id);

    if (numDeleted === 0) {
      return failure(StatusCodes.NOT_FOUND);
    }

    this.logger.info('Account deleted', { id });

    return success();
  }
}

function toAccountSummary(account: Account): AccountSummary {
  const { _id, username, email, createdAt } = account;
  return {
    id: _id!.toString(),
    username,
    email,
    createdAt,
  };
}

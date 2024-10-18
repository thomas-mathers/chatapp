import {
  AccountSummary,
  CreateAccountRequest,
} from 'chatapp.account-service-contracts';
import { createHash, createJwt } from 'chatapp.crypto';
import { EventBus, EventName } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import {
  ResultCode,
  conflict,
  created,
  notFound,
  ok,
  okResult,
} from 'chatapp.status-code-result';
import { MongoError } from 'mongodb';

import { Config } from '../config';
import { Account } from '../models/account';
import { AccountRepository } from '../repositories/accountRepository';

export class AccountService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async createAccount(
    request: CreateAccountRequest,
  ): Promise<ResultCode<AccountSummary>> {
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

      const jwt = createJwt(
        { userId: account._id!.toString(), username: account.username },
        this.config.jwt,
      );

      this.eventBus.produce({
        name: EventName.ACCOUNT_CREATED,
        accountId: account._id!.toString(),
        accountName: account.username,
        accountEmail: account.email,
        token: jwt,
      });

      this.logger.info('Account created', {
        id: account._id,
        username: account.username,
        email: account.email,
      });

      return created(accountSummary);
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        return conflict();
      }
      throw error;
    }
  }

  async getAccountById(id: string): Promise<ResultCode<AccountSummary>> {
    const account = await this.accountRepository.getAccountById(id);

    if (!account) {
      return notFound();
    }

    const accountSummary = toAccountSummary(account);

    return okResult(accountSummary);
  }

  async deleteAccount(id: string): Promise<ResultCode<void>> {
    const numDeleted = await this.accountRepository.deleteAccountById(id);

    if (numDeleted === 0) {
      return notFound();
    }

    this.logger.info('Account deleted', { id });

    return ok();
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

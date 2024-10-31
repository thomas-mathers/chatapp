import {
  AccountRegistrationRequest,
  AccountServiceErrorCode,
  AccountSummary,
  GetAccountsRequest,
  Page,
} from 'chatapp.account-service-contracts';
import { createHash, createJwt } from 'chatapp.crypto';
import { EventBus, EventName } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { Result } from 'typescript-result';

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

  async register(
    request: AccountRegistrationRequest,
  ): Promise<Result<AccountSummary, AccountServiceErrorCode>> {
    if (await this.accountRepository.containsUsername(request.username)) {
      return Result.error(AccountServiceErrorCode.UsernameExists);
    }

    if (await this.accountRepository.containsEmail(request.email)) {
      return Result.error(AccountServiceErrorCode.EmailExists);
    }

    const hash = await createHash(request.password);

    const account = await this.accountRepository.createAccount({
      username: request.username,
      password: hash,
      email: request.email,
      emailVerified: false,
      dateCreated: new Date(),
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

    return Result.ok(accountSummary);
  }

  async getAccountById(
    id: string,
  ): Promise<Result<AccountSummary, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getAccountById(id);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    const accountSummary = toAccountSummary(account);

    return Result.ok(accountSummary);
  }

  async getAccounts(
    request: GetAccountsRequest,
  ): Promise<Page<AccountSummary>> {
    const page = await this.accountRepository.getAccounts(request);

    return {
      ...page,
      records: page.records.map(toAccountSummary),
    };
  }

  async deleteAccount(
    id: string,
  ): Promise<Result<void, AccountServiceErrorCode>> {
    const numDeleted = await this.accountRepository.deleteAccountById(id);

    if (numDeleted === 0) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    this.logger.info('Account deleted', { id });

    return Result.ok();
  }
}

export function toAccountSummary(account: Account): AccountSummary {
  const { _id, username, email, dateCreated } = account;
  return {
    id: _id!.toString(),
    username,
    email,
    dateCreated: dateCreated.toISOString(),
  };
}

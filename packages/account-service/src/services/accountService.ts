import {
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
import { toAccountSummary } from '../mappers/toAccountSummary';
import { AccountRepository } from '../repositories/accountRepository';

export class AccountService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async register(
    username: string,
    password: string,
    email: string,
    emailVerified: boolean,
  ): Promise<Result<AccountSummary, AccountServiceErrorCode>> {
    if (await this.accountRepository.containsUsername(username)) {
      return Result.error(AccountServiceErrorCode.UsernameExists);
    }

    if (await this.accountRepository.containsEmail(email)) {
      return Result.error(AccountServiceErrorCode.EmailExists);
    }

    const passwordHash = await createHash(password);

    const account = await this.accountRepository.insert({
      username,
      password: passwordHash,
      email,
      emailVerified,
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
      emailVerified: account.emailVerified,
    });

    this.logger.info('Account created', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok(accountSummary);
  }

  async getById(
    id: string,
  ): Promise<Result<AccountSummary, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    const accountSummary = toAccountSummary(account);

    return Result.ok(accountSummary);
  }

  async getByEmail(
    email: string,
  ): Promise<Result<AccountSummary, AccountServiceErrorCode>> {
    const account = await this.accountRepository.getByEmail(email);

    if (!account) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    const accountSummary = toAccountSummary(account);

    return Result.ok(accountSummary);
  }

  async getPage(request: GetAccountsRequest): Promise<Page<AccountSummary>> {
    const page = await this.accountRepository.getPage(request);

    return {
      ...page,
      records: page.records.map(toAccountSummary),
    };
  }

  async deleteById(id: string): Promise<Result<void, AccountServiceErrorCode>> {
    const numDeleted = await this.accountRepository.deleteById(id);

    if (numDeleted === 0) {
      return Result.error(AccountServiceErrorCode.AccountNotFound);
    }

    this.logger.info('Account deleted', { id });

    return Result.ok();
  }
}

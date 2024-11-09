import {
  AccountSummary,
  GetAccountsRequest,
  Page,
} from 'chatapp.account-service-contracts';
import { ApiError, ApiErrorCode } from 'chatapp.api-error';
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

  async create(
    username: string,
    password: string,
    email: string,
    emailVerified: boolean,
  ): Promise<Result<AccountSummary, ApiError>> {
    if (await this.accountRepository.containsUsername(username)) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.UsernameExists }),
      );
    }

    if (await this.accountRepository.containsEmail(email)) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.EmailExists }),
      );
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

  async getOrCreateByEmail(
    email: string,
  ): Promise<Result<AccountSummary, ApiError>> {
    const account = await this.accountRepository.getByEmail(email);

    return account
      ? Result.ok(toAccountSummary(account))
      : this.create(email, '', email, true);
  }

  async getById(id: string): Promise<Result<AccountSummary, ApiError>> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    const accountSummary = toAccountSummary(account);

    return Result.ok(accountSummary);
  }

  async getByEmail(email: string): Promise<Result<AccountSummary, ApiError>> {
    const account = await this.accountRepository.getByEmail(email);

    if (!account) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
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

  async deleteById(id: string): Promise<Result<void, ApiError>> {
    const numDeleted = await this.accountRepository.deleteById(id);

    if (numDeleted === 0) {
      return Result.error(
        ApiError.fromErrorCode({ code: ApiErrorCode.AccountNotFound }),
      );
    }

    this.logger.info('Account deleted', { id });

    return Result.ok();
  }
}

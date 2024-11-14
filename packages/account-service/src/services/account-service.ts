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
import { toAccountSummary } from '../mappers/to-account-summary';
import { Account } from '../models/account';
import { AccountRepository } from '../repositories';

export class AccountService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly accountRepository: AccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async insert({
    _id,
    username,
    password,
    email,
    emailVerified,
    profilePictureUrl,
    oauthProviderAccountIds,
    dateCreated = new Date(),
  }: Account): Promise<Result<AccountSummary, ApiError>> {
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
      _id,
      username,
      password: passwordHash,
      email,
      emailVerified,
      profilePictureUrl,
      oauthProviderAccountIds,
      dateCreated,
    });

    const accountSummary = toAccountSummary(account);

    const confirmEmailToken = createJwt(
      { userId: account._id!.toString(), username: account.username },
      this.config.jwt,
    );

    this.eventBus.produce({
      name: EventName.ACCOUNT_CREATED,
      accountId: account._id!.toString(),
      accountName: account.username,
      accountEmail: account.email,
      token: confirmEmailToken,
      emailVerified: account.emailVerified,
    });

    this.logger.info('Account created', {
      id: account._id,
      username: account.username,
      email: account.email,
    });

    return Result.ok(accountSummary);
  }

  async getById(id: string): Promise<AccountSummary | null> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      return null;
    }

    const accountSummary = toAccountSummary(account);

    return accountSummary;
  }

  async getByEmail(email: string): Promise<AccountSummary | null> {
    const account = await this.accountRepository.getByEmail(email);

    if (!account) {
      return null;
    }

    const accountSummary = toAccountSummary(account);

    return accountSummary;
  }

  async getByLinkedAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<AccountSummary | null> {
    const account = await this.accountRepository.getByLinkedAccount(
      provider,
      providerAccountId,
    );

    if (!account) {
      return null;
    }

    const accountSummary = toAccountSummary(account);

    return accountSummary;
  }

  async containsEmail(email: string): Promise<boolean> {
    return await this.accountRepository.containsEmail(email);
  }

  async getPage(request: GetAccountsRequest): Promise<Page<AccountSummary>> {
    const page = await this.accountRepository.getPage(request);

    return {
      ...page,
      records: page.records.map(toAccountSummary),
    };
  }

  async patch(
    accountId: string,
    changes: Partial<Account>,
  ): Promise<Account | null> {
    return await this.accountRepository.patch(accountId, changes);
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

import { ObjectId } from 'mongodb';
import { Profile } from 'passport';
import { Result } from 'typescript-result';

import { ApiError } from '../../../api-error/src/apiError';
import { ApiErrorCode } from '../../../api-error/src/apiErrorCode';
import { toExternalAccountSummary } from '../mappers/toExternalAccountSummary';
import { ExternalAccountSummary } from '../models/externalAccountSummary';
import { ExternalAccountRepository } from '../repositories/externalAccountRepository';
import { AccountService } from './accountService';

interface CreateExternalAccountRequest {
  accountId: string;
  provider: string;
  providerAccountId: string;
}

export class ExternalAccountService {
  constructor(
    private readonly externalAccountRepository: ExternalAccountRepository,
    private readonly accountService: AccountService,
  ) {}

  async getOrCreateByExternalProfile(provider: string, profile: Profile) {
    const externalAccount = await this.getByProvider(provider, profile.id);

    if (externalAccount) {
      return await Result.fromAsync(
        this.accountService.getById(externalAccount.accountId),
      ).getOrThrow();
    }

    const email = profile.emails?.[0].value;

    if (!email) {
      throw ApiError.fromErrorCode(ApiErrorCode.EmailMissing);
    }

    const account = await Result.fromAsync(
      this.accountService.getOrCreateByEmail(email),
    ).getOrThrow();

    await this.insert({
      accountId: account.id,
      provider,
      providerAccountId: profile.id,
    });

    return account;
  }

  private async insert({
    accountId,
    provider,
    providerAccountId,
  }: CreateExternalAccountRequest): Promise<ExternalAccountSummary> {
    const externalAccount = await this.externalAccountRepository.insert({
      accountId: new ObjectId(accountId),
      provider,
      providerAccountId,
      dateCreated: new Date(),
    });
    return toExternalAccountSummary(externalAccount);
  }

  private async getByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<ExternalAccountSummary | null> {
    const externalAccount = await this.externalAccountRepository.getByProvider(
      provider,
      providerAccountId,
    );

    if (!externalAccount) {
      return null;
    }

    return toExternalAccountSummary(externalAccount);
  }
}

import { ObjectId } from 'mongodb';

import { toExternalAccountSummary } from '../mappers/toExternalAccountSummary';
import { ExternalAccountSummary } from '../models/externalAccountSummary';
import { ExternalAccountRepository } from '../repositories/externalAccountRepository';

interface CreateExternalAccountRequest {
  accountId: string;
  provider: string;
  providerAccountId: string;
}

export class ExternalAccountService {
  constructor(
    private readonly externalAccountRepository: ExternalAccountRepository,
  ) {}

  async insert({
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

  async getByProvider(
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

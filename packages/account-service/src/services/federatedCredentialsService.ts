import { ObjectId } from 'mongodb';

import { toFederatedCredentialsSummary } from '../mappers/toFederatedCredentialsSummary';
import { FederatedCredentialsSummary } from '../models/federatedCredentialsSummary';
import { FederatedCredentialsRepository } from '../repositories/federatedCredentialsRepository';

interface CreateFederatedCredentialsRequest {
  accountId: string;
  provider: string;
  providerAccountId: string;
}

export class FederatedCredentialsService {
  constructor(private readonly federatedCredentialsRepository: FederatedCredentialsRepository) {}

  async insert({
    accountId,
    provider,
    providerAccountId,
  }: CreateFederatedCredentialsRequest): Promise<FederatedCredentialsSummary> {
    const credentials = await this.federatedCredentialsRepository.insert({
      accountId: new ObjectId(accountId),
      provider,
      providerAccountId,
      dateCreated: new Date(),
    });
    return toFederatedCredentialsSummary(credentials);
  }

  async getByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<FederatedCredentialsSummary | null> {
    const credentials = await this.federatedCredentialsRepository.getByProvider(
      provider,
      providerAccountId,
    );

    if (!credentials) {
      return null;
    }

    return toFederatedCredentialsSummary(credentials);
  }
}

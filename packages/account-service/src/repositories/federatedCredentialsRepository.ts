import { Collection } from 'mongodb';

import { FederatedCredentials } from '../models/federatedCredentials';

export class FederatedCredentialsRepository {
  constructor(private readonly _collection: Collection<FederatedCredentials>) {}

  async insert(
    credentials: FederatedCredentials,
  ): Promise<FederatedCredentials> {
    await this._collection.insertOne(credentials);
    return credentials;
  }

  async getByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<FederatedCredentials | null> {
    return await this._collection.findOne({
      provider,
      providerAccountId,
    });
  }
}

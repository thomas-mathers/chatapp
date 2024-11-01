import { Collection } from 'mongodb';

import { ExternalAccount } from '../models/externalAccount';

export class ExternalAccountRepository {
  constructor(private readonly _collection: Collection<ExternalAccount>) {}

  async insert(account: ExternalAccount): Promise<ExternalAccount> {
    await this._collection.insertOne(account);
    return account;
  }

  async getByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<ExternalAccount | null> {
    return await this._collection.findOne({
      provider,
      providerAccountId,
    });
  }
}

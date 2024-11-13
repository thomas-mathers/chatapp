import {
  GetAccountsRequest,
  Page,
  SortDirection,
} from 'chatapp.account-service-contracts';
import { Collection, ObjectId, Sort } from 'mongodb';

import { Account } from '../models/account';

export class AccountRepository {
  constructor(private readonly accountCollection: Collection<Account>) {}

  async insert(account: Account): Promise<Account> {
    await this.accountCollection.insertOne(account);
    return account;
  }

  async containsUsername(username: string): Promise<boolean> {
    const document = await this.getByUsername(username);
    return document !== null;
  }

  async containsEmail(email: string): Promise<boolean> {
    const document = await this.getByEmail(email);
    return document !== null;
  }

  async getById(id: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ _id: new ObjectId(id) });
  }

  async getByUsername(username: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ username });
  }

  async getByEmail(email: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ email });
  }

  async getByLinkedAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    return await this.accountCollection.findOne({
      [`linkedAccounts.${provider}`]: providerAccountId,
    });
  }

  async getPage({
    accountIds,
    page = 1,
    pageSize = 10,
    sortBy = 'username',
    sortDirection = SortDirection.Asc,
  }: GetAccountsRequest): Promise<Page<Account>> {
    const filter = accountIds
      ? { _id: { $in: accountIds.map((t) => new ObjectId(t)) } }
      : {};

    const totalRecords = await this.accountCollection.countDocuments(filter);

    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    const sort: Sort = { [sortBy]: sortDirection === 'asc' ? 1 : -1 };

    const records = await this.accountCollection
      .find(filter, { skip, limit, sort })
      .toArray();

    return {
      records,
      totalRecords,
      page,
      pageSize,
      totalPages: Math.ceil(totalRecords / pageSize),
    };
  }

  async update(replacement: Account): Promise<void> {
    const { username } = replacement;
    await this.accountCollection.replaceOne({ username }, replacement);
  }

  async patch(id: string, patch: Partial<Account>): Promise<Account | null> {
    const result = await this.accountCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: 'after' },
    );

    return result;
  }

  async deleteById(id: string): Promise<number> {
    const { deletedCount } = await this.accountCollection.deleteOne(
      { _id: new ObjectId(id) },
      {},
    );
    return deletedCount;
  }
}

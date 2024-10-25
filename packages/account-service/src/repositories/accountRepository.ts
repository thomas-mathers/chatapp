import {
  GetAccountsRequest,
  Page,
  SortDirection,
} from 'chatapp.account-service-contracts';
import { Collection, Sort } from 'mongodb';

import { Account } from '../models/account';

export class AccountRepository {
  constructor(private readonly accountCollection: Collection<Account>) {}

  async createAccount(account: Account): Promise<Account> {
    await this.accountCollection.insertOne(account);
    return account;
  }

  async containsAccount(username: string): Promise<boolean> {
    const document = this.getAccountByUsername(username);
    return document !== null;
  }

  async getAccountById(id: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ _id: id });
  }

  async getAccountByUsername(username: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ username });
  }

  async getAccountByEmail(email: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ email });
  }

  async getAccounts({
    accountIds,
    page = 1,
    pageSize = 10,
    sortBy = 'username',
    sortDirection = SortDirection.Asc,
  }: GetAccountsRequest): Promise<Page<Account>> {
    const filter = accountIds ? { _id: { $in: accountIds } } : {};

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

  async updateAccount(replacement: Account): Promise<Account> {
    const { username } = replacement;
    await this.accountCollection.replaceOne({ username }, replacement);
    return replacement;
  }

  async deleteAccountById(id: string): Promise<number> {
    const { deletedCount } = await this.accountCollection.deleteOne(
      { _id: id },
      {},
    );
    return deletedCount;
  }
}

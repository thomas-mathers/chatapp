import { Collection, ObjectId } from 'mongodb';

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
    return await this.accountCollection.findOne({ _id: new ObjectId(id) });
  }

  async getAccountByUsername(username: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ username });
  }

  async getAccountByEmail(email: string): Promise<Account | null> {
    return await this.accountCollection.findOne({ email });
  }

  async updateAccount(replacement: Account): Promise<Account> {
    const { username } = replacement;
    await this.accountCollection.replaceOne({ username }, replacement);
    return replacement;
  }

  async deleteAccountById(id: string): Promise<number> {
    const { deletedCount } = await this.accountCollection.deleteOne(
      { _id: new ObjectId(id) },
      {},
    );
    return deletedCount;
  }
}

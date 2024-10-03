import { GetAccountsRequest, Page } from 'chatapp.account-service-contracts';
import { Sort } from 'mongodb';

import { getAccountsCollection } from '../databaseClient';
import Account from '../models/account';

const accountCollection = getAccountsCollection();

export async function createAccount(account: Account): Promise<Account> {
  await accountCollection.insertOne(account);
  return account;
}

export async function containsAccount(username: string): Promise<boolean> {
  const document = getAccountByUsername(username);
  return document !== null;
}

export async function getAccountByUsername(
  username: string,
): Promise<Account | null> {
  return await accountCollection.findOne({ username });
}

export async function getAccounts({
  page,
  pageSize,
  sortBy,
  sortDirection,
}: GetAccountsRequest): Promise<Page<Account>> {
  const totalRecords = await accountCollection.countDocuments();

  const skip = page * pageSize;
  const limit = pageSize;
  const sort: Sort = {
    [sortBy]: sortDirection === 'asc' ? 1 : -1,
  };

  const records = await accountCollection
    .find({}, { skip, limit, sort })
    .toArray();

  return {
    records,
    totalRecords,
    page,
    pageSize,
    totalPages: Math.ceil(totalRecords / pageSize),
  };
}

import { AccountSummary } from 'chatapp.account-service-contracts';

import { Account } from '../models/account';

export function toAccountSummary(account: Account): AccountSummary {
  const { _id, username, email, dateCreated } = account;
  return {
    id: _id!.toString(),
    username,
    email,
    dateCreated: dateCreated.toISOString(),
  };
}

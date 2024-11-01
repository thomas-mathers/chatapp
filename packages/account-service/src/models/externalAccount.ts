import { ObjectId } from 'mongodb';

export interface ExternalAccount {
  _id?: ObjectId;
  accountId: ObjectId;
  provider: string;
  providerAccountId: string;
  dateCreated: Date;
}

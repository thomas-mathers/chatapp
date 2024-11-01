import { ObjectId } from 'mongodb';

export interface FederatedCredentials {
  _id?: ObjectId;
  accountId: ObjectId;
  provider: string;
  providerAccountId: string;
  dateCreated: Date;
}

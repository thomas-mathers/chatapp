import { ObjectId } from 'mongodb';

export interface Message {
  _id?: ObjectId;
  accountId: string;
  accountUsername: string;
  content: string;
  dateCreated: Date;
}

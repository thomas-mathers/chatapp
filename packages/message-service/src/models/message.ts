import { ObjectId } from 'mongodb';

export interface Message {
  _id?: ObjectId;
  accountId: string;
  username: string;
  profilePictureUrl: string | null;
  content: string;
  dateCreated: Date;
}

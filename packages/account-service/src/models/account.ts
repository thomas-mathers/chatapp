import { ObjectId } from 'mongodb';

export interface Account {
  _id?: ObjectId;
  username: string;
  password: string;
  email: string;
  emailVerified: boolean;
  profilePictureUrl: string | null;
  dateCreated: Date;
}

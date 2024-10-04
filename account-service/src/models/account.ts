import { ObjectId } from 'mongodb';

export default interface Account {
  _id?: ObjectId;
  username: string;
  password: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
}

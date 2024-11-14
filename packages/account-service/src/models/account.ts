import { ObjectId } from 'mongodb';

import { OauthProvider } from './oauth-provider';

export interface Account {
  _id?: ObjectId;
  username: string;
  password: string;
  email: string;
  emailVerified: boolean;
  profilePictureUrl: string | null;
  oauthProviderAccountIds: { [key in OauthProvider]?: string };
  dateCreated: Date;
}

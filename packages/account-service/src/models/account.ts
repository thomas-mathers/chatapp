export interface Account {
  _id?: string;
  username: string;
  password: string;
  email: string;
  emailVerified: boolean;
  dateCreated: Date;
}

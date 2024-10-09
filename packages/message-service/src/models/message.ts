export interface Message {
  _id?: string;
  accountId: string;
  accountUsername: string;
  content: string;
  dateCreated: Date;
}

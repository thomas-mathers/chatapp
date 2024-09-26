import { v4 as uuidv4 } from 'uuid';

export default class Message {
  id: string;
  accountId: string;
  message: string;
  dateCreated: Date;

  constructor(accountId: string, message: string) {
    this.id = uuidv4();
    this.accountId = accountId;
    this.message = message;
    this.dateCreated = new Date();
  }
}

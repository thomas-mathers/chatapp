export default class Account {
  id: string;
  password: string;
  dateCreated: Date;

  constructor(id: string, password: string, dateCreated: Date = new Date()) {
    this.id = id;
    this.password = password;
    this.dateCreated = dateCreated;
  }
}

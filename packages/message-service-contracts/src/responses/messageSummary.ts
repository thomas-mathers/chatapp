export interface MessageSummary {
  id: string;
  accountId: string;
  username: string;
  profilePictureUrl: string | null;
  content: string;
  dateCreated: string;
}

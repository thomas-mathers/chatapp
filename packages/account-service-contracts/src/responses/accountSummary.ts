export interface AccountSummary {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  linkedAccounts: Record<string, string>;
  dateCreated: string;
}

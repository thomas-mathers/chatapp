export {};

declare global {
  namespace Express {
    export interface Request {
      accountId: string;
      accountUsername: string;
    }
  }
}
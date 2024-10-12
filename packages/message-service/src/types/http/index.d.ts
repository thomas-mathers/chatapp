export {};

declare module 'http' {
  interface IncomingMessage {
    accountId: string;
    accountUsername: string;
  }
}

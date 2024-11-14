export interface FileService {
  upload(accountId: string, name: string, contents: Buffer): Promise<string>;
  download(accountId: string, name: string): Promise<Buffer | null>;
}

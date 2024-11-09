export interface FileService {
  upload(name: string, contents: Buffer): Promise<string>;
  download(name: string): Promise<Buffer | null>;
}

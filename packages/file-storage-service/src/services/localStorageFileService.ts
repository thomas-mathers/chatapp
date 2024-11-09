import fs from 'fs';
import path from 'path';

import { Config } from '../config';
import { FileService } from './fileService';

export class LocalStorageFileService implements FileService {
  constructor(private readonly _config: Config) {}

  async upload(filename: string, file: Buffer): Promise<string> {
    const filePath = path.join(this._config.basePath, filename);

    const fileDir = path.dirname(filePath);

    await fs.promises.mkdir(fileDir, { recursive: true });

    await fs.promises.writeFile(filePath, file);

    return filename;
  }

  async download(filename: string): Promise<Buffer | null> {
    const filePath = path.join(this._config.basePath, filename);

    const bytes = await fs.promises.readFile(filePath);

    return bytes;
  }
}

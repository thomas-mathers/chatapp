import { FileUploadResponse } from 'chatapp.file-storage-service-contracts';

import { HttpClient } from './httpClient';

export class FileStorageServiceClient {
  constructor(private readonly httpClient: HttpClient) {}

  async upload(
    accountId: string,
    filename: string,
    contents: Blob,
  ): Promise<FileUploadResponse> {
    const body = new FormData();

    body.append('file', contents);

    const response = await this.httpClient.postFormData<FileUploadResponse>({
      path: `/files/${accountId}/${filename}`,
      body,
    });

    return response;
  }
}

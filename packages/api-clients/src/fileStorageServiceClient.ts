import { FileUploadResponse } from 'chatapp.file-storage-service-contracts';

import { ApiClient } from './apiClient';

export class FileStorageServiceClient {
  constructor(private readonly apiClient: ApiClient) {}

  async upload(
    accountId: string,
    filename: string,
    contents: Blob,
  ): Promise<FileUploadResponse> {
    const body = new FormData();

    body.append('file', contents);

    const response = await this.apiClient.postFormData<FileUploadResponse>({
      path: `/files/${accountId}/${filename}`,
      body,
    });

    return response;
  }
}

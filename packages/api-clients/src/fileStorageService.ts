import { FileUploadResponse } from 'chatapp.file-storage-service-contracts';

import { ApiClient } from './apiClient';

export class FileStorageService {
  constructor(private readonly apiClient: ApiClient) {}

  async uploadFile(
    fileName: string,
    contents: Blob,
  ): Promise<FileUploadResponse> {
    const formData = new FormData();

    formData.append(fileName, contents);

    const response = await this.apiClient.requestFormData<FileUploadResponse>({
      method: 'POST',
      path: '/files',
      body: formData,
    });

    return response;
  }
}

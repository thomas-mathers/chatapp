import {
  GetMessagesRequest,
  MessageSummary,
  Page,
} from 'chatapp.message-service-contracts';

import { HttpClient } from './httpClient';

export class MessageServiceClient {
  constructor(private readonly httpClient: HttpClient) {}

  public async getMessages(
    { page, pageSize, sortBy, sortDirection }: GetMessagesRequest,
    accessToken: string,
  ): Promise<Page<MessageSummary>> {
    const queryParameters: Record<string, string> = {};

    if (page) {
      queryParameters['page'] = page.toString();
    }
    if (pageSize) {
      queryParameters['pageSize'] = pageSize.toString();
    }
    if (sortBy) {
      queryParameters['sortBy'] = sortBy;
    }
    if (sortDirection) {
      queryParameters['sortDirection'] = sortDirection;
    }

    const result = await this.httpClient.getJson<Page<MessageSummary>>({
      path: '/messages',
      queryParameters,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result;
  }
}

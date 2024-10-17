import {
  GetMessagesRequest,
  MessageSummary,
  Page,
} from 'chatapp.message-service-contracts';

import { ApiClient } from './apiClient';
import { JwtService } from './jwtService';

export class MessageService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly jwtService: JwtService,
  ) {}

  public async getMessages({
    page,
    pageSize,
    sortBy,
    sortDirection,
  }: GetMessagesRequest): Promise<Page<MessageSummary>> {
    try {
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

      return await this.apiClient.requestJson<Page<MessageSummary>>({
        method: 'GET',
        path: '/messages',
        queryParameters,
        headers: {
          Authorization: `Bearer ${this.jwtService.getJwt()}`,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

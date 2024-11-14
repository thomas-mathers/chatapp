import { AccountServiceClient } from 'chatapp.api-clients';
import {
  GetMessagesRequest,
  MessageSummary,
  Page,
} from 'chatapp.message-service-contracts';

import { Config } from '../config';
import { toMessageSummary } from '../mappers/to-message-summary';
import { MessageRepository } from '../repositories/message-repository';

export class MessageService {
  constructor(
    private readonly config: Config,
    private readonly messageRepository: MessageRepository,
    private readonly accountServiceClient: AccountServiceClient,
  ) {}

  async createMessage(id: string, content: string): Promise<MessageSummary> {
    const { username, profilePictureUrl } =
      await this.accountServiceClient.getAccountById(
        id,
        this.config.accountService.apiKey,
      );

    const message = await this.messageRepository.createMessage({
      accountId: id,
      username,
      profilePictureUrl,
      content,
      dateCreated: new Date(),
    });

    return toMessageSummary(message);
  }

  async getMessages(req: GetMessagesRequest): Promise<Page<MessageSummary>> {
    const page = await this.messageRepository.getMessages(req);
    return {
      ...page,
      records: page.records.map(toMessageSummary),
    };
  }
}

import { MessageSummary } from 'chatapp.message-service-contracts';

import { Message } from '../models/message';

export function toMessageSummary(message: Message): MessageSummary {
  const { _id, accountId, username, profilePictureUrl, content, dateCreated } =
    message;
  return {
    id: _id!.toHexString(),
    accountId,
    username,
    profilePictureUrl,
    content,
    dateCreated: dateCreated.toISOString(),
  };
}

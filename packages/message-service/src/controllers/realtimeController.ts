import { ChatAppLogger } from 'chatapp.logging';

import { Config } from '../config';
import { MessageService } from '../services/messageService';

export class RealtimeController {
  constructor(
    readonly config: Config,
    readonly logger: ChatAppLogger,
    readonly messageService: MessageService,
  ) {}
}

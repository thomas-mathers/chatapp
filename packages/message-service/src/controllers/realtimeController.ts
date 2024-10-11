import { Logger } from 'chatapp.logging';

import { Config } from '../config';
import { MessageService } from '../services/messageService';

export class RealtimeController {
  constructor(
    readonly config: Config,
    readonly logger: Logger,
    readonly messageService: MessageService,
  ) {}
}

import ampq from 'amqplib';
import { ChatAppEvent } from 'chatapp.events';

import { Config } from '../config';

export class EventProducerService {
  constructor(
    private readonly ampqChannel: ampq.Channel,
    private readonly config: Config,
  ) {}

  async produce({ name, payload }: ChatAppEvent): Promise<void> {
    this.ampqChannel.publish(
      this.config.rabbitMq.exchangeName,
      name,
      Buffer.from(JSON.stringify(payload)),
    );
  }
}

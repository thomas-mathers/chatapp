import ampq from "amqplib";
import { ChatAppEvent } from "../chatAppEvent";

export class EventProducerService {
  constructor(
    private readonly ampqChannel: ampq.Channel,
    private readonly exchangeName: string
  ) {}

  async produce(event: ChatAppEvent): Promise<void> {
    this.ampqChannel.publish(
      this.exchangeName,
      event.name,
      Buffer.from(JSON.stringify(event))
    );
  }
}

import ampq from "amqplib";
import { Logger } from "winston";
import { EventHandler } from "../eventHandler";
import { ChatAppEventName } from "../chatAppEventName";
import { ChatAppEvent } from "../chatAppEvent";
import { EventHandlerRegistration } from "../eventHandlerRegistration";

export class EventConsumerService {
  constructor(
    private readonly logger: Logger,
    private readonly url: string,
    private readonly exchangeName: string,
    private readonly registrations: {
      [K in ChatAppEventName]?: EventHandlerRegistration<any>;
    }
  ) {}

  async consume(): Promise<void> {
    const ampqConnection = await ampq.connect(this.url);
    const ampqChannel = await ampqConnection.createChannel();

    await ampqChannel.assertExchange(this.exchangeName, "topic", {});

    for (const [name, registration] of Object.entries(this.registrations)) {
      const { queue } = await ampqChannel.assertQueue("", {});

      await ampqChannel.bindQueue(queue, this.exchangeName, name);

      ampqChannel.consume(queue, async (message) => {
        if (!message) {
          return;
        }

        const content = message.content.toString();

        const { success, data, error } = registration.schema.safeParse(
          JSON.parse(content)
        );

        if (!success) {
          this.logger.error("Error parsing message", { content, error });
          ampqChannel.reject(message, false);
          return;
        }

        await registration.eventHandler.handle(data);

        ampqChannel.ack(message);
      });
    }

    this.logger.info("Consuming messages");
  }
}

import ampq from "amqplib";
import { ChatAppLogger } from "chatapp.logging";
import { ChatAppEvent } from "../chatAppEvent";
import { EventHandlerRegistration } from "../eventHandlerRegistration";
import { ChatAppEventName } from "../chatAppEventName";

export class EventService {
  private ampqConnection!: ampq.Connection;
  private ampqChannel!: ampq.Channel;

  constructor(
    private readonly logger: ChatAppLogger,
    private readonly url: string,
    private readonly exchangeName: string,
    private readonly registrations: {
      [key in ChatAppEventName]?: EventHandlerRegistration<any>;
    }
  ) {}

  async connect() {
    this.ampqConnection = await ampq.connect(this.url);
    this.ampqChannel = await this.ampqConnection.createChannel();

    await this.ampqChannel.assertExchange(this.exchangeName, "topic", {});
  }

  async produce(event: ChatAppEvent): Promise<void> {
    this.ampqChannel.publish(
      this.exchangeName,
      event.name,
      Buffer.from(JSON.stringify(event))
    );
  }

  async consume(): Promise<void> {
    for (const [name, registration] of Object.entries(this.registrations)) {
      const { queue } = await this.ampqChannel.assertQueue("", {});

      await this.ampqChannel.bindQueue(queue, this.exchangeName, name);

      this.ampqChannel.consume(queue, async (message) => {
        if (!message) {
          return;
        }

        const content = message.content.toString();

        const { success, data, error } = registration.schema.safeParse(
          JSON.parse(content)
        );

        if (!success) {
          this.logger.error("Error parsing message", { name, content, error });
          this.ampqChannel.reject(message, false);
          return;
        }

        try {
          await registration.eventHandler.handle(data);
        } catch (error) {
          this.logger.error("Error handling message", {
            name,
            error,
          });

          this.ampqChannel.reject(message, false);
          return;
        }

        this.ampqChannel.ack(message);
      });
    }

    this.logger.info("Consuming messages");
  }
}

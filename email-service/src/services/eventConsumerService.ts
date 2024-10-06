import ampq from "amqplib";
import { Logger } from "winston";
import { Config } from "../config";

export class EventConsumerService {
  constructor(
    private readonly logger: Logger,
    private readonly config: Config,
    private readonly eventHandlers: { [key: string]: EventHandler }
  ) {}

  async listen(): Promise<void> {
    const ampqConnection = await ampq.connect(this.config.RABBIT_MQ_URL);
    const ampqChannel = await ampqConnection.createChannel();

    await ampqChannel.assertExchange(
      this.config.RABBIT_MQ_EXCHANGE_NAME,
      "topic",
      {}
    );

    for (const routingKey of Object.keys(this.eventHandlers)) {
      const { queue } = await ampqChannel.assertQueue("", {});

      await ampqChannel.bindQueue(
        queue,
        this.config.RABBIT_MQ_EXCHANGE_NAME,
        routingKey
      );

      ampqChannel.consume(queue, async (message) => {
        if (!message) {
          return;
        }

        const handler = this.eventHandlers[routingKey];

        if (!handler) {
          this.logger.error(`No handler for ${routingKey}`);
          ampqChannel.reject(message, false);
          return;
        }

        try {
          const event = JSON.parse(message.content.toString());
          await handler.handle(event);
          ampqChannel.ack(message);
        } catch (error) {
          this.logger.error("Error handling message", {
            error: error.message,
          });

          ampqChannel.reject(message, false);
        }
      });
    }

    this.logger.info("Consuming messages");
  }
}

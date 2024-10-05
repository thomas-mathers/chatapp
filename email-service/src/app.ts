import ampq from "amqplib";

import { config } from "./config";
import { emailMessageSchema } from "./emailMessage";
import { sendEmail } from "./emailService";
import { logger } from "./logger";

async function main() {
  try {
    const ampqConnection = await ampq.connect(config.RABBIT_MQ_URL);

    logger.info("Connected to RabbitMQ");

    const emailChannel = await ampqConnection.createChannel();

    logger.info("Created channel");

    await emailChannel.assertQueue(config.RABBIT_MQ_QUEUE_NAME, {
      durable: true,
    });

    logger.info("Asserted queue");

    emailChannel.consume(config.RABBIT_MQ_QUEUE_NAME, async (message) => {
      if (!message) {
        return;
      }

      const { success, data, error } = emailMessageSchema.safeParse(
        message.content.toString()
      );

      if (!success) {
        logger.error(`Invalid message: ${error}`);
        return;
      }

      await sendEmail(data);

      emailChannel.ack(message);
    });

    logger.info("Consuming messages");
  } catch (error) {
    logger.error(error);
  }
}

main();

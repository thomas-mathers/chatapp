import ampq from "amqplib";
import { createLogger, format, transports } from "winston";

import { config } from "./config";
import { emailMessageSchema } from "./emailMessage";
import { sendEmail } from "./emailService";

async function main() {
  const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
  });

  const ampqConnection = await ampq.connect(config.RABBIT_MQ_URL);
  const ampqChannel = await ampqConnection.createChannel();

  await ampqChannel.assertQueue(config.RABBIT_MQ_QUEUE_NAME, {
    durable: true,
  });

  ampqChannel.consume(config.RABBIT_MQ_QUEUE_NAME, async (message) => {
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

    ampqChannel.ack(message);
  });

  logger.info("Consuming messages");
}

main();

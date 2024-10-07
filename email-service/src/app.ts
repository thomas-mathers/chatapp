import { createLogger, format, transports } from "winston";
import { Resend } from "resend";
import dotenv from "dotenv";

import { EmailService } from "./services/emailService";
import { configSchema } from "./config";
import {
  ChatAppEventName,
  EventConsumerService,
  requestResetPasswordSchema,
} from "chatapp.event-sourcing";
import { RequestResetPasswordEventHandler } from "./event-handlers/requestResetPasswordEventHandler";

async function main() {
  dotenv.config();

  const config = configSchema.parse(process.env);

  const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
  });

  const resend = new Resend(config.RESEND_API_KEY);

  const emailService = new EmailService(logger, resend);

  const eventHandlers = {
    [ChatAppEventName.REQUEST_RESET_PASSWORD]: {
      schema: requestResetPasswordSchema,
      eventHandler: new RequestResetPasswordEventHandler(logger),
    },
  };

  const eventService = new EventConsumerService(
    logger,
    config.RABBIT_MQ_URL,
    config.RABBIT_MQ_EXCHANGE_NAME,
    eventHandlers
  );

  await eventService.consume();
}

main();

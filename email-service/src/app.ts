import { Resend } from "resend";
import dotenv from "dotenv";
import {
  ChatAppEventName,
  EventService,
  requestResetPasswordSchema,
} from "chatapp.event-sourcing";
import { ChatAppLogger } from "chatapp.logging";

import { EmailService } from "./services/emailService";
import { configSchema } from "./config";
import { RequestResetPasswordEventHandler } from "./event-handlers/requestResetPasswordEventHandler";

async function main() {
  dotenv.config();

  const config = configSchema.parse(process.env);

  const logger = new ChatAppLogger();

  const resend = new Resend(config.RESEND_API_KEY);

  const emailService = new EmailService(logger, resend);

  const eventHandlers = {
    [ChatAppEventName.REQUEST_RESET_PASSWORD]: {
      schema: requestResetPasswordSchema,
      eventHandler: new RequestResetPasswordEventHandler(
        config,
        logger,
        emailService
      ),
    },
  };

  const eventService = new EventService(
    logger,
    config.RABBIT_MQ_URL,
    config.RABBIT_MQ_EXCHANGE_NAME,
    eventHandlers
  );

  await eventService.connect();
  await eventService.consume();
}

main();

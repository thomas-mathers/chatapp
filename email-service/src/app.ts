import { createLogger, format, transports } from "winston";
import { Resend } from "resend";
import dotenv from "dotenv";

import { EmailService } from "./services/emailService";
import { configSchema } from "./config";
import { EventConsumerService } from "./services/eventConsumerService";
import { EventName } from "chatapp.events";
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
    [EventName.REQUEST_RESET_PASSWORD]: new RequestResetPasswordEventHandler(
      logger
    ),
  };

  const eventService = new EventConsumerService(logger, config, eventHandlers);

  await eventService.listen();
}

main();

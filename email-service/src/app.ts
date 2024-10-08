import { createLogger, format, transports } from "winston";
import { Resend } from "resend";
import dotenv from "dotenv";

import { EmailService } from "./services/emailService";
import { configSchema } from "./config";
import {
  ChatAppEventName,
  EventService,
  requestResetPasswordSchema,
} from "chatapp.event-sourcing";
import { RequestResetPasswordEventHandler } from "./event-handlers/requestResetPasswordEventHandler";

async function main() {
  dotenv.config();

  const config = configSchema.parse(process.env);

  const logger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD h:mm:ss a",
      }),
      format.colorize(),
      format.printf(({ timestamp, level, message, ...rest }) => {
        if (Object.keys(rest).length > 0) {
          const json = JSON.stringify(rest, null, 2);
          return `[${timestamp}] ${level}: ${message}\r\n\r\n${json}\r\n`;
        } else {
          return `[${timestamp}] ${level}: ${message}\r\n`;
        }
      })
    ),
    transports: [new transports.Console()],
  });

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

import { Logger } from "winston";
import { ChatAppEvent, EventHandler } from "chatapp.events";

export class RequestResetPasswordEventHandler implements EventHandler {
  constructor(private readonly logger: Logger) {}

  async handle(event: ChatAppEvent): Promise<void> {
    this.logger.info("Handling RequestResetPassword event", {
      event,
    });
  }
}

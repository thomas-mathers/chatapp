import { Logger } from "winston";
import { EventHandler, RequestResetPassword } from "chatapp.event-sourcing";

export class RequestResetPasswordEventHandler
  implements EventHandler<RequestResetPassword>
{
  constructor(private readonly logger: Logger) {}

  async handle(event: RequestResetPassword): Promise<void> {
    this.logger.info("Handling RequestResetPassword event", {
      event,
    });
  }
}

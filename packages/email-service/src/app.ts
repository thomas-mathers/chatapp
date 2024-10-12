import {
  EventBus,
  EventName,
  requestResetPasswordSchema,
} from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { Resend } from 'resend';

import { Config } from './config';
import { RequestResetPasswordEventHandler } from './event-handlers/requestResetPasswordEventHandler';
import { EmailService } from './services/emailService';

export class App {
  private constructor(
    private _logger: Logger,
    private _eventBus: EventBus,
  ) {}

  static async launch(config: Config): Promise<App> {
    const logger = new Logger();

    const resend = new Resend(config.RESEND_API_KEY);

    const emailService = new EmailService(logger, resend);

    const eventHandlers = {
      [EventName.REQUEST_RESET_PASSWORD]: {
        schema: requestResetPasswordSchema,
        eventHandler: new RequestResetPasswordEventHandler(
          config,
          logger,
          emailService,
        ),
      },
    };

    const eventService = new EventBus(
      logger,
      config.RABBIT_MQ_URL,
      config.RABBIT_MQ_EXCHANGE_NAME,
      eventHandlers,
    );

    await eventService.connect();
    await eventService.consume();

    return new App(logger, eventService);
  }

  async close() {
    await this.closeEventBus();
  }

  private async closeEventBus() {
    await this._eventBus.close();
    this._logger.info('Event bus closed');
  }
}

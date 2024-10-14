import {
  EventBus,
  EventName,
  accountCreatedSchema,
  requestResetPasswordSchema,
} from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';
import { Resend } from 'resend';

import { Config } from './config';
import { AccountCreatedEventHandler } from './event-handlers/accountCreatedEventHandler';
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
      [EventName.ACCOUNT_CREATED]: {
        schema: accountCreatedSchema,
        eventHandler: new AccountCreatedEventHandler(
          config,
          logger,
          emailService,
        ),
      },
      [EventName.REQUEST_RESET_PASSWORD]: {
        schema: requestResetPasswordSchema,
        eventHandler: new RequestResetPasswordEventHandler(
          config,
          logger,
          emailService,
        ),
      },
    };

    const eventBus = new EventBus(
      logger,
      config.RABBIT_MQ_URL,
      config.RABBIT_MQ_EXCHANGE_NAME,
      eventHandlers,
    );

    await eventBus.connect();
    await eventBus.consume();

    return new App(logger, eventBus);
  }

  async close() {
    await this.closeEventBus();
  }

  private async closeEventBus() {
    await this._eventBus.close();
    this._logger.info('Event bus closed');
  }
}

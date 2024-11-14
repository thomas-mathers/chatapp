import { AccountCreated } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';

import { Config } from '../config';
import { EmailMessage } from '../email-message';
import { EmailService } from '../services/email-service';

export class AccountCreatedEventHandler {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly emailService: EmailService,
  ) {}

  async handle(event: AccountCreated): Promise<void> {
    if (event.emailVerified) {
      return;
    }

    this.logger.info('Sending welcome email', {
      accountEmail: event.accountEmail,
      accountName: event.accountName,
    });

    try {
      await this.emailService.send(this.createEmailConfirmationEmail(event));
    } catch (error) {
      this.logger.error('Error sending welcome email', {
        accountEmail: event.accountEmail,
        accountName: event.accountName,
        error,
      });

      throw error;
    }
  }

  private createEmailConfirmationEmail({
    accountEmail,
    token,
  }: AccountCreated): EmailMessage {
    const subject = 'Welcome to ChatApp';

    const url = `${this.config.SPA_URL}/confirm-email?token=${token}`;

    const text = `Click here to confirm your email: ${url}`;

    const html = `<a href="${url}">Click here to confirm your email</a>`;

    return {
      from: this.config.ADMIN_EMAIL,
      to: accountEmail,
      subject,
      text,
      html,
    };
  }
}

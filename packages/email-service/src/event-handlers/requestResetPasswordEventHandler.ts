import { EventHandler, RequestResetPassword } from 'chatapp.event-sourcing';
import { Logger } from 'chatapp.logging';

import { Config } from '../config';
import { EmailMessage } from '../emailMessage';
import { EmailService } from '../services/emailService';

export class RequestResetPasswordEventHandler
  implements EventHandler<RequestResetPassword>
{
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly emailService: EmailService,
  ) {}

  async handle({
    accountEmail,
    accountName,
    token,
  }: RequestResetPassword): Promise<void> {
    this.logger.info('Sending reset password email', {
      accountEmail,
      accountName,
    });

    try {
      await this.emailService.send(
        this.createRequestResetPasswordEmail(accountEmail, token),
      );
    } catch (error) {
      this.logger.error('Error sending reset password email', {
        accountEmail,
        accountName,
        error,
      });

      throw error;
    }
  }

  private createRequestResetPasswordEmail(
    accountEmail: string,
    token: string,
  ): EmailMessage {
    const url = `${this.config.SPA_URL}/reset-password?token=${token}`;
    return {
      from: this.config.ADMIN_EMAIL,
      to: accountEmail,
      subject: 'Reset your password',
      text: `Click here to reset your password: ${url}`,
      html: `<a href="${url}">Click here to reset your password</a>`,
    };
  }
}

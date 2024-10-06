import { Resend } from "resend";
import { EmailMessage } from "../emailMessage";
import { Logger } from "winston";

export class EmailService {
  constructor(
    private readonly logger: Logger,
    private readonly resend: Resend
  ) {}

  async send({ from, to, subject, text, html }: EmailMessage): Promise<void> {
    await this.resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    this.logger.info(`Email sent to ${to}`);
  }
}

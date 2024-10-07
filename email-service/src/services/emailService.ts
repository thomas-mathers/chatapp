import { Resend } from "resend";
import { EmailMessage } from "../emailMessage";
import { Logger } from "winston";

export class EmailService {
  constructor(
    private readonly logger: Logger,
    private readonly resend: Resend
  ) {}

  async send({ from, to, subject, text, html }: EmailMessage): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      this.logger.error("Error sending email", { to, subject, error });

      throw new Error(error.message);
    }

    this.logger.info("Successfully sent email", { to, subject, data });
  }
}

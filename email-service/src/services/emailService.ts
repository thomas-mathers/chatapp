import { Resend } from "resend";
import { EmailMessage } from "../emailMessage";
import { ChatAppLogger } from "chatapp.logging";

export class EmailService {
  constructor(
    private readonly logger: ChatAppLogger,
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

      throw error;
    }

    this.logger.info("Successfully sent email", { to, subject, data });
  }
}

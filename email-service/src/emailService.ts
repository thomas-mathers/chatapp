import { Resend } from "resend";
import { config } from "./config";
import { EmailMessage } from "./emailMessage";

const resend = new Resend(config.RESEND_API_KEY);

export async function sendEmail({
  from,
  to,
  subject,
  text,
  html,
}: EmailMessage): Promise<void> {
  await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });

  console.log(`Email sent to ${to}`);
}

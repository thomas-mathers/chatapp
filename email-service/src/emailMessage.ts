export default interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

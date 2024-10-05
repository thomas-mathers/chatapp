import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const schema = z.object({
  RESEND_API_KEY: z.string(),
  RABBIT_MQ_URL: z.string(),
  RABBIT_MQ_QUEUE_NAME: z.string(),
});

const config = schema.parse(process.env);

export { config };

import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const schema = z
  .object({
    PORT: z.coerce.number(),
    RESEND_API_KEY: z.string(),
  })
  .transform((obj) => ({
    port: obj.PORT,
    resendApiKey: obj.RESEND_API_KEY,
  }));

const config = schema.parse(process.env);

export default config;

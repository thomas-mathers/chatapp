import { z } from 'zod';

export const createMessageRequestSchema = z.object({
  content: z.string().min(1).max(1000),
});

type CreateMessageRequest = z.infer<typeof createMessageRequestSchema>;

export default CreateMessageRequest;

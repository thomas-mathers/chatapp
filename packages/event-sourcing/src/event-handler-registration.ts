import { ZodSchema } from 'zod';

import { EventHandler } from './event-handler';

export interface EventHandlerRegistration<T> {
  schema: ZodSchema<T>;
  eventHandler: EventHandler<T>;
}

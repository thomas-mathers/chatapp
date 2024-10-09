import { ZodSchema } from 'zod';

import { EventHandler } from './eventHandler';

export interface EventHandlerRegistration<T> {
  schema: ZodSchema<T>;
  eventHandler: EventHandler<T>;
}

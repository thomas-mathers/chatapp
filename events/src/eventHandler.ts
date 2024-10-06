import { ChatAppEvent } from "./events";

export interface EventHandler {
  handle(event: ChatAppEvent): Promise<void>;
}

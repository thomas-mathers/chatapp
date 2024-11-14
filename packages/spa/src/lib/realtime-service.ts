import {
  CreateMessageRequest,
  MessageSummary,
} from 'chatapp.message-service-contracts';

interface RealtimeServiceSubscription {
  unsubscribe: () => void;
}

export class RealtimeService {
  private constructor(private readonly socket: WebSocket) {}

  public static create(url: string): Promise<RealtimeService> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        resolve(new RealtimeService(socket));
      };

      socket.onerror = (error) => {
        reject(error);
      };
    });
  }

  public send(data: CreateMessageRequest) {
    this.socket.send(JSON.stringify(data));
  }

  public subscribe(
    onMessageReceived: (message: MessageSummary) => void,
  ): RealtimeServiceSubscription {
    const handler = (event: MessageEvent) => {
      onMessageReceived(JSON.parse(event.data));
    };

    this.socket.addEventListener('message', handler);

    return {
      unsubscribe: () => {
        this.socket.removeEventListener('message', handler);
      },
    };
  }

  public close() {
    this.socket.close();
  }
}

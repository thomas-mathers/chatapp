import {
  CreateMessageRequest,
  MessageSummary,
} from 'chatapp.message-service-contracts';

interface RealtimeMessageServiceSubscription {
  unsubscribe: () => void;
}

export class RealtimeMessageService {
  private constructor(private readonly socket: WebSocket) {}

  public static create(url: string): Promise<RealtimeMessageService> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        resolve(new RealtimeMessageService(socket));
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
  ): RealtimeMessageServiceSubscription {
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

export enum EventName {
  REQUEST_RESET_PASSWORD = "chatapp.account.request-reset-password",
}

interface RequestResetPasswordEvent {
  name: EventName.REQUEST_RESET_PASSWORD;
  payload: {
    accountId: string;
    accountName: string;
    accountEmail: string;
    token: string;
  };
}

export type ChatAppEvent = RequestResetPasswordEvent;

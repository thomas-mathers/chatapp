export interface ApiError<T> {
  code: T;
  message: string;
  details: Record<string, unknown>;
}

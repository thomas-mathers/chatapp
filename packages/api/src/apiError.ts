export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

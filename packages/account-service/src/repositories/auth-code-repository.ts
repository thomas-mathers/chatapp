import { RedisClientType } from 'redis';

export class AuthCodeRepository {
  constructor(private readonly redisClient: RedisClientType) {}

  public async insert(code: string, accessToken: string): Promise<void> {
    await this.redisClient.set(code, accessToken, { EX: 300 });
  }

  public async get(code: string): Promise<string | null> {
    return this.redisClient.get(code);
  }

  public async delete(code: string): Promise<void> {
    await this.redisClient.del(code);
  }
}

import { createClient, RedisClientType } from 'redis';

export class RedisClient {
  private client: RedisClientType;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('Redis client error', err);
    });

    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to Redis');
    } catch (err) {
      console.error('Could not connect to Redis', err);
    }
  }

  public async set(key: string, value: string): Promise<void> {
    try {
      await this.client.set(key, value);
    } catch (err) {
      console.error('Error setting key in Redis', err);
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Error getting key from Redis', err);
      return null;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Error deleting key from Redis', err);
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (err) {
      console.error('Error checking key existence in Redis', err);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      console.log('Disconnected from Redis');
    } catch (err) {
      console.error('Error disconnecting from Redis', err);
    }
  }
}

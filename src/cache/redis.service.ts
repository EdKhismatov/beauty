import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import type { RedisClientType, SetOptions } from '@redis/client';
import { REDIS } from './cache.provider';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  logger = new Logger(RedisService.name);
  @Inject(REDIS)
  private readonly redis: RedisClientType;

  async set(key: string, value: Record<string, any> | string, options?: SetOptions) {
    const json = JSON.stringify(value);

    return this.redis.set(key, json, options);
  }

  async get<T extends Record<string, any>>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.log(`Ошибка при чтении ключа ${key} из Redis:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async deleteForPattern(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }

    return keys.length;
  }

  async onApplicationShutdown() {
    this.logger.log('--- Завершение работы Redis ---');
    try {
      await this.redis.quit();
      this.logger.log('--- Соединение с Redis успешно закрыто ---');
    } catch (error) {
      this.logger.error('Ошибка при закрытии Redis:', error);
    }
  }
}

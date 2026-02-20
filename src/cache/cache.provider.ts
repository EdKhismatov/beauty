import { Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { appConfig } from '../config';

export const REDIS = 'REDIS';

export const redisProvider: Provider = {
  provide: REDIS,
  useFactory: async () => {
    const redis = createClient({ url: appConfig.redisUrl });

    await redis.connect();

    return redis;
  },
};

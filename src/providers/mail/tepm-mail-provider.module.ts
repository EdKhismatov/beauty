import { Module } from '@nestjs/common';
import { RedisModule } from '../../cache/redis.module';
import { TempMailProvider } from './temp-mail.provider';

@Module({
  imports: [RedisModule],
  controllers: [],
  providers: [TempMailProvider],
  exports: [TempMailProvider],
})
export class TempMailProviderModule {}

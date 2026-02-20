import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TempMailProviderModule } from '../mail/tepm-mail-provider.module';
import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), TempMailProviderModule],
  controllers: [],
  providers: [CronService],
  exports: [],
})
export class CronModule {}

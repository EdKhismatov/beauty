import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TempMailProvider } from '../mail/temp-mail.provider';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly mailProvider: TempMailProvider) {}

  @Cron('1 * * * *')
  async handleCron() {
    try {
      this.logger.log('Начинаю обновление доменов...');
      await this.mailProvider.refreshBadDomains();
    } catch (error) {
      this.logger.error('Не удалось обновить домены:', error.message);
    }
  }
}

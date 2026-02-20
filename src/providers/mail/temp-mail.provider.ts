import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../cache/redis.service';

@Injectable()
export class TempMailProvider {
  private readonly logger = new Logger(TempMailProvider.name);
  constructor(private readonly redisService: RedisService) {}

  async refreshBadDomains() {
    try {
      const { data } = await axios.get<string>(
        'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt',
      );

      const domains = data.split('\n').filter((d) => d.trim() !== '');
      this.logger.log(`Загружено ${domains.length} доменов. Обновляю Redis...`);

      for (const domain of domains) {
        await this.redisService.set(`bad_domain:${domain.trim()}`, '1', { EX: 90000 });
      }
      this.logger.log('Список временных доменов успешно обновлен');
    } catch (error) {
      this.logger.error('Ошибка при загрузке списка доменов:', error.message);
    }
  }
}

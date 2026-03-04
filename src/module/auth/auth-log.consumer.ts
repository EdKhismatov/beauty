import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { RmqAckInterceptor } from '../../common/interceptors/rmq-ack.interceptor';
import { LoginAttemptEntity } from '../../database/entities/login-attempt.entity';
import { AuthLogEvents } from './auth-log.events';

@UseInterceptors(RmqAckInterceptor)
@Controller()
export class AuthLogConsumer {
  constructor(
    @InjectModel(LoginAttemptEntity)
    private loginAttemptEntity: typeof LoginAttemptEntity,
  ) {}

  @EventPattern(AuthLogEvents.logAuthAttempt)
  async handleAuthLog(@Payload() data: any) {
    await this.loginAttemptEntity.create(data);
  }
}

import { Module } from '@nestjs/common';
import { RedisModule } from '../../cache/redis.module';
import { RabbitmqModule } from '../../message-broker/rabbitmq.module';
import { EmailModule } from '../mailer/email.module';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, RedisModule, EmailModule, RabbitmqModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

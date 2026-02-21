import { Module } from '@nestjs/common';
import { RedisModule } from '../../cache/redis.module';
import { AuthGuard } from '../../guards/jwt.guard';
import { RabbitmqModule } from '../../message-broker/rabbitmq.module';
import { EmailModule } from '../mailer/email.module';
import { UserModule } from '../users/user.module';
import { UserService } from '../users/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, RedisModule, EmailModule, RabbitmqModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, AuthGuard],
  exports: [AuthService, UserService, AuthGuard],
})
export class AuthModule {}

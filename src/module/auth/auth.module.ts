import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '../../cache/redis.module';
import { LoginAttemptEntity } from '../../database/entities/login-attempt.entity';
import { RabbitmqModule } from '../../message-broker/rabbitmq.module';
import { EmailModule } from '../mailer/email.module';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLogConsumer } from './auth-log.consumer';

@Module({
  imports: [
    forwardRef(() => UserModule),
    RedisModule,
    EmailModule,
    RabbitmqModule,
    SequelizeModule.forFeature([LoginAttemptEntity]),
  ],
  controllers: [AuthController, AuthLogConsumer],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

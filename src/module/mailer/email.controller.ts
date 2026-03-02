import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { LoginAttemptEntity } from '../../database/entities/login-attempt.entity';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly emailService: EmailService,
    @InjectModel(LoginAttemptEntity)
    private loginAttempEntity: typeof LoginAttemptEntity,
  ) {}

  // Подтверждение почты
  @EventPattern('send_welcome_email')
  async handleEmailSending(@Payload() data: { email: string; url: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log('Поймали событие!', data);
      await this.emailService.sendWelcomeEmail(data.email, data.url);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.log('Ошибка! Возвращаем в очередь...', `${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  // Отправка кода для восстановления пароля
  @EventPattern('send_password_reset_email')
  async handlePasswordResetEmail(@Payload() data: { email: string; keys: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log('Поймали событие!', data);
      await this.emailService.sendPasswordResetCode(data.email, data.keys);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.log('Ошибка! Возвращаем в очередь...', `${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  // восстановление пароля c кодом подтверждения
  @EventPattern('send_password_recovery_email')
  async handlePasswordRecoveryEmail(@Payload() data: { email: string; message: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log('Поймали событие!', data);
      await this.emailService.sendPasswordRecoveryCode(data.email, data.message);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.log('Ошибка! Возвращаем в очередь...', `${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern('log_auth_attempt')
  async handleAuthLog(@Payload() data: any) {
    try {
      await this.loginAttempEntity.create(data);
    } catch (e) {
      this.logger.error('Ошибка записи лога в RabbitMQ:', e.message);
    }
  }
}

import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  // Подтверждение почты
  @EventPattern('send_welcome_email')
  async handleEmailSending(data: { email: string; url: string }) {
    this.logger.log('Поймали событие из RabbitMQ!', data);
    await this.emailService.sendWelcomeEmail(data.email, data.url);
  }

  // Отправка кода для восстановления пароля
  @EventPattern('send_password_reset_email')
  async handlePasswordResetEmail(data: { email: string; keys: string }) {
    this.logger.log('Поймали событие из RabbitMQ!', data);
    await this.emailService.sendPasswordResetCode(data.email, data.keys);
  }

  // восстановление пароля c кодом подтверждения
  @EventPattern('send_password_recovery_email')
  async handlePasswordRecoveryEmail(data: { email: string; message: string }) {
    this.logger.log('Поймали событие из RabbitMQ!', data);
    await this.emailService.sendPasswordRecoveryCode(data.email, data.message);
  }
}

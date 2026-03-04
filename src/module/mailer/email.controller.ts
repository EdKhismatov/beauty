import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RmqAckInterceptor } from '../../common/interceptors/rmq-ack.interceptor';
import { EmailEvents } from './email.events';
import { EmailService } from './email.service';

@UseInterceptors(RmqAckInterceptor)
@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  // Подтверждение почты
  @EventPattern(EmailEvents.sendWelcomeEmail)
  async handleEmailSending(@Payload() data: { email: string; url: string }) {
    await this.emailService.sendWelcomeEmail(data.email, data.url);
  }

  // Отправка кода для восстановления пароля
  @EventPattern(EmailEvents.sendPasswordResetEmail)
  async handlePasswordResetEmail(@Payload() data: { email: string; keys: string }) {
    await this.emailService.sendPasswordResetCode(data.email, data.keys);
  }

  // восстановление пароля c кодом подтверждения
  @EventPattern(EmailEvents.sendPasswordRecoveryEmail)
  async handlePasswordRecoveryEmail(@Payload() data: { email: string; message: string }) {
    await this.emailService.sendPasswordRecoveryCode(data.email, data.message);
  }
}

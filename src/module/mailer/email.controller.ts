import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('send_welcome_email')
  async handleEmailSending(data: { email: string; url: string }) {
    console.log('Поймали событие из RabbitMQ!', data);
    await this.emailService.sendWelcomeEmail(data.email, data.url);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Добро пожаловать!',
        html: `
      <h1>Приветик!</h1>
      <p>Чтобы подтвердить почту, перейди по ссылке:</p>
      <a href="${token}">Подтвердить регистрацию</a>
    `,
      });
      this.logger.log(`Письмо успешно отправлено на ${to}`);
    } catch (error) {
      this.logger.error(`Ошибка при отправке письма на ${to}: ${error.message}`);
    }
  }
}

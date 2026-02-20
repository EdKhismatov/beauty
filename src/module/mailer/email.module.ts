import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { appConfig } from '../../config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.yandex.ru',
        port: 587,
        secure: false,
        auth: {
          user: appConfig.smtp.user,
          pass: appConfig.smtp.pass,
        },
      },
      defaults: {
        from: appConfig.smtp.email, // Default sender address
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './module/auth/auth.module';
import { EmailModule } from './module/mailer/email.module';

@Module({
  imports: [DatabaseModule, AuthModule, EmailModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './module/auth/auth.module';
import { CitiesModule } from './module/cities/cities.module';
import { EmailModule } from './module/mailer/email.module';
import { MinioModule } from './module/minio/minio.module';

@Module({
  imports: [DatabaseModule, AuthModule, EmailModule, MinioModule, CitiesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

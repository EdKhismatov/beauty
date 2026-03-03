import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { GuardsModule } from './guards/guards.module';
import { AuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthModule } from './module/auth/auth.module';
import { CitiesModule } from './module/cities/cities.module';
import { EmailModule } from './module/mailer/email.module';
import { MasterModule } from './module/masters/master.module';
import { MinioModule } from './module/minio/minio.module';
import { UserModule } from './module/users/user.module';

@Module({
  imports: [DatabaseModule, AuthModule, EmailModule, MinioModule, CitiesModule, UserModule, GuardsModule, MasterModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: AuthGuard, // ← useExisting вместо useClass
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RMQ_MAIL_CLIENT } from './rabbitmq.config';

@Module({
  imports: [ClientsModule.register([RMQ_MAIL_CLIENT])],
  exports: [ClientsModule],
})
export class RabbitmqModule {}

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { appConfig } from '../config';
import { Queue } from './rabbitmq.queue';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [appConfig.rabbitUrl],
          queue: Queue.mailQueue,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [],
  exports: [ClientsModule],
})
export class RabbitmqModule {}

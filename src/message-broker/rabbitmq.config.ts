import { RmqOptions, Transport } from '@nestjs/microservices';
import { appConfig } from '../config';
import { Queue } from './rabbitmq.queue';

// Для клиента (отправитель)
export const RMQ_MAIL_CLIENT = {
  name: 'MAIL_SERVICE',
  transport: Transport.RMQ as const,
  options: {
    urls: [appConfig.rabbitUrl],
    queue: Queue.mailQueue,
    queueOptions: {
      durable: true,
    },
  },
};

// Для consumer (получатель) в main.ts
export const RMQ_MAIL_MICROSERVICE: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [appConfig.rabbitUrl],
    queue: Queue.mailQueue,
    noAck: false,
    prefetchCount: 1,
    queueOptions: {
      durable: true,
    },
  },
};

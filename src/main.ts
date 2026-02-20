import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import process from 'node:process';
import { bootstrapSwagger } from 'src/bootstrap/index';
import { AppModule } from './app.module';
import { appConfig } from './config';
import { Environment } from './config/dto';
import { DEVELOPMENT_STRATEGY, PinoService, PRODUCTION_STRATEGY } from './logger';

async function bootstrap() {
  const pinoStrategy = process.env.NODE_ENV === Environment.DEV ? DEVELOPMENT_STRATEGY : PRODUCTION_STRATEGY;
  const logger = new PinoService(pinoStrategy);

  const app = await NestFactory.create(AppModule, new FastifyAdapter({ trustProxy: true }));
  bootstrapSwagger(app);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [appConfig.rabbitUrl],
      queue: 'mail_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

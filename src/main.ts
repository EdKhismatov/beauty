import contentParser from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import process from 'node:process';
import { bootstrapSwagger } from 'src/bootstrap/index';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
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
      noAck: false,
      queueOptions: {
        durable: false,
      },
    },
  });

  app.enableShutdownHooks();

  await app.startAllMicroservices();

  const fastifyInstance = app.getHttpAdapter().getInstance();

  await fastifyInstance.register(contentParser, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

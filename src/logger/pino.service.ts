import { LoggerService } from '@nestjs/common';
import pino from 'pino';

export class PinoService implements LoggerService {
  private readonly pino: pino.Logger;

  constructor(strategy: pino.LoggerOptions | pino.Logger) {
    this.pino = pino(strategy);
  }

  public log(message: string, context: string): void {
    this.pino.info({ message, context });
  }

  public error(messageOrError: string | Error, context: string): void {
    let message: string | Record<string, any> = messageOrError;

    if (messageOrError instanceof Error) {
      message = {
        message: messageOrError.message,
        stack: messageOrError.stack,
      };
    }

    this.pino.error({ message, context });
  }

  public warn(message: string, context: string): void {
    this.pino.warn({ message, context });
  }

  public debug(message: string, context: string): void {
    this.pino.debug({ message, context });
  }
}

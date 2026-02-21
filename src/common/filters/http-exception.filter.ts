import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PinoService } from '../../logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Определяем статус: если это HttpException — берем его статус, иначе — 500
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Вытаскиваем сообщение об ошибке
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : String(exception);

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message || (exceptionResponse as any).error
        : exceptionResponse;

    this.logger.error(
      {
        path: request.url,
        method: request.method,
        status,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
      } as unknown as Error,
      'Global exception interceptor',
    );
    // Отправляем красивый ответ
    response.status(status).send({
      status: 'error',
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}

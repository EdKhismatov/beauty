import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { catchError, EMPTY, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RmqAckInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RmqAck');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const channel = rmqContext.getChannelRef();
    const originalMsg = rmqContext.getMessage();

    return next.handle().pipe(
      tap(() => channel.ack(originalMsg)),

      // Ошибка — retry логика в одном месте
      catchError((error) => {
        this.logger.error(`Ошибка обработки: ${error.message}`);
        channel.nack(originalMsg, false, false); // → в DLQ
        return EMPTY;
      }),
    );
  }
}

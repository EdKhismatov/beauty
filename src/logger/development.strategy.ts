import pino from 'pino';
import { COMMON_STRATEGY } from './common.strategy';

export const DEVELOPMENT_STRATEGY: pino.LoggerOptions = {
  ...COMMON_STRATEGY,
  formatters: {
    ...COMMON_STRATEGY.formatters,
    bindings: () => ({}),
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      timestampKey: 'timestamp',
      messageKey: 'message',
    },
  },
};

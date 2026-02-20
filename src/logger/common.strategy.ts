import pino from 'pino';

export const COMMON_STRATEGY: pino.LoggerOptions = {
  messageKey: 'message',
  errorKey: 'message',
  timestamp: false,
  serializers: { err: (value: any) => value },
  formatters: {
    level: (level) => {
      return { level: level.toLocaleUpperCase() };
    },
  },
  mixin: () => {
    return { timestamp: new Date().toISOString() };
  },
};

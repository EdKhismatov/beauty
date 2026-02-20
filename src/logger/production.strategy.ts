import pino from 'pino';
import { COMMON_STRATEGY } from './common.strategy';

export const PRODUCTION_STRATEGY: pino.LoggerOptions = {
  ...COMMON_STRATEGY,
  formatters: {
    ...COMMON_STRATEGY.formatters,
    bindings: () => ({
      appName: process.env.npm_package_name ?? 'unknown',
      appVersion: process.env.npm_package_version ?? 'unknown',
    }),
  },
};

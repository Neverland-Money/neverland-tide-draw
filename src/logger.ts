import pino from 'pino';

type ContextType = any;

class LoggerAdapter {
  constructor(private logger: pino.Logger) {}

  info(msg: string, context?: ContextType): void {
    this.logger.info(context, msg);
  }

  warn(msg: string, context?: ContextType): void {
    this.logger.warn(context, msg);
  }

  error(msg: string, context?: ContextType): void {
    this.logger.error(context, msg);
  }

  debug(msg: string, context?: ContextType): void {
    this.logger.debug(context, msg);
  }
}

export function createLogger(name: string, pretty = true): LoggerAdapter {
  const transport = pretty
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      })
    : undefined;

  const pinoLogger = pino(
    {
      name,
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label: string) => {
          return { level: label.toUpperCase() };
        },
      },
    },
    transport
  );

  return new LoggerAdapter(pinoLogger);
}

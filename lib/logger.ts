type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(payload: LogPayload): string {
    if (this.isProduction) {
      return JSON.stringify({
        ...payload,
        error:
          payload.error instanceof Error
            ? {
                name: payload.error.name,
                message: payload.error.message,
                stack: payload.error.stack,
              }
            : payload.error,
      });
    }

    const { timestamp, level, message, context, error } = payload;
    const colors = {
      debug: '\x1b[35m', // Magenta
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m',
    };

    const levelStr = `${colors[level]}[${level.toUpperCase()}]${colors.reset}`;
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const errorStr = error
      ? `\nError: ${error instanceof Error ? error.stack : JSON.stringify(error)}`
      : '';

    return `[${timestamp}] ${levelStr} - ${message}${contextStr}${errorStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error | unknown
  ) {
    const payload: LogPayload = {
      message,
      level,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatMessage(payload);

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isProduction) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>, error?: Error | unknown) {
    this.log('warn', message, context, error);
  }

  error(message: string, context?: Record<string, any>, error?: Error | unknown) {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();
export default logger;

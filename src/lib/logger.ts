/**
 * Logger utility for API monitoring and debugging
 * Based on TRD section 9.1
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log('warn', message, data, context);
  }

  error(message: string, error?: unknown, context?: string): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log('error', message, errorData, context);
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log('debug', message, data, context);
  }

  // API specific logging
  apiRequest(endpoint: string, method: string, body?: unknown): void {
    this.info(`API Request: ${method} ${endpoint}`, { body }, 'api');
  }

  apiResponse(endpoint: string, status: number, duration: number): void {
    this.info(`API Response: ${endpoint}`, { status, duration: `${duration}ms` }, 'api');
  }

  apiError(endpoint: string, error: unknown): void {
    this.error(`API Error: ${endpoint}`, error, 'api');
  }
}

export const logger = new Logger();

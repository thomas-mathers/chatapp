import {
  Logger as WinstonLogger,
  createLogger,
  format,
  transports,
} from 'winston';

import { LogLevel } from './logLevel';
import { LogOptions } from './logOptions';
import { printf } from './utils/printf';

export class Logger {
  private readonly logger: WinstonLogger;

  constructor({
    level = LogLevel.Info,
    timestampFormat = 'YYYY-MM-DD h:mm:ss a',
    maxLogFileSize = 10 * 1024 * 10234,
    maxLogFiles = 7,
    logFilename = 'logs/combined.log',
    errorLogFilename = 'logs/error.log',
  }: Partial<LogOptions> = {}) {
    this.logger = createLogger({
      level,
      format: format.combine(
        format.timestamp({
          format: timestampFormat,
        }),
        format.colorize(),
        format.printf(({ timestamp, level, message, ...properties }) =>
          printf(timestamp, level, message, properties),
        ),
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          level: 'error',
          filename: errorLogFilename,
          maxsize: maxLogFileSize,
          maxFiles: maxLogFiles,
          tailable: true,
          zippedArchive: true,
        }),
        new transports.File({
          filename: logFilename,
          maxsize: maxLogFileSize,
          maxFiles: maxLogFiles,
          tailable: true,
          zippedArchive: true,
        }),
      ],
    });
  }

  error(message: string, properties: object = {}) {
    this.logger.error(message, properties);
  }

  warn(message: string, properties: object = {}) {
    this.logger.warn(message, properties);
  }

  info(message: string, properties: object = {}) {
    this.logger.info(message, properties);
  }

  http(message: string, properties: object = {}) {
    this.logger.http(message, properties);
  }

  verbose(message: string, properties: object = {}) {
    this.logger.verbose(message, properties);
  }

  debug(message: string, properties: object = {}) {
    this.logger.debug(message, properties);
  }

  silly(message: string, properties: object = {}) {
    this.logger.silly(message, properties);
  }
}

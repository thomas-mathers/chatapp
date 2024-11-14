import { LogLevel } from './log-level';

export interface LogOptions {
  level: LogLevel;
  timestampFormat: string;
  maxLogFileSize: number;
  maxLogFiles: number;
  logFilename: string;
  errorLogFilename: string;
}

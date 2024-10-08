import { LogLevel } from "./logLevel";

export interface LogOptions {
  level: LogLevel;
  timestampFormat: string;
  maxLogFileSize: number;
  maxLogFiles: number;
}

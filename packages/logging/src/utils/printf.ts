import { prettyPrint } from './pretty-print';

export function printf(
  timestamp: string,
  level: string,
  message: unknown,
  properties: object,
) {
  if (Object.keys(properties).length > 0) {
    return `[${timestamp}] ${level}: ${message}\r\n\r\n${prettyPrint(
      properties,
    )}\r\n`;
  } else {
    return `[${timestamp}] ${level}: ${message}\r\n`;
  }
}

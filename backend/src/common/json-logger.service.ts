import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLoggerService implements LoggerService {
  log(message: string, ...optionalParams: string[]) {
    const meta: Record<string, unknown> = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
    };
    if (optionalParams.length) meta.context = optionalParams;
    console.log(JSON.stringify(meta));
  }

  error(message: string | Error, ...optionalParams: string[]) {
    const serialized =
      message instanceof Error
        ? { name: message.name, message: message.message, stack: message.stack }
        : message;
    const meta: Record<string, unknown> = {
      level: 'error',
      message: serialized,
      timestamp: new Date().toISOString(),
    };
    if (optionalParams.length) meta.context = optionalParams;
    console.error(JSON.stringify(meta));
  }

  warn(message: string, ...optionalParams: string[]) {
    const meta: Record<string, unknown> = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
    };
    if (optionalParams.length) meta.context = optionalParams;
    console.warn(JSON.stringify(meta));
  }

  debug?(message: string, ...optionalParams: string[]) {
    const meta: Record<string, unknown> = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
    };
    if (optionalParams.length) meta.context = optionalParams;
    console.debug(JSON.stringify(meta));
  }

  verbose?(message: string, ...optionalParams: string[]) {
    const meta: Record<string, unknown> = {
      level: 'verbose',
      message,
      timestamp: new Date().toISOString(),
    };
    if (optionalParams.length) meta.context = optionalParams;
    console.log(JSON.stringify(meta));
  }
}

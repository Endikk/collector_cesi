import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLoggerService implements LoggerService {
    log(message: any, ...optionalParams: any[]) {
        console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...optionalParams }));
    }

    error(message: any, ...optionalParams: any[]) {
        const serialized = message instanceof Error
            ? { name: message.name, message: message.message, stack: message.stack }
            : message;
        console.error(JSON.stringify({ level: 'error', message: serialized, timestamp: new Date().toISOString(), ...optionalParams }));
    }

    warn(message: any, ...optionalParams: any[]) {
        console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...optionalParams }));
    }

    debug?(message: any, ...optionalParams: any[]) {
        console.debug(JSON.stringify({ level: 'debug', message, timestamp: new Date().toISOString(), ...optionalParams }));
    }

    verbose?(message: any, ...optionalParams: any[]) {
        console.log(JSON.stringify({ level: 'verbose', message, timestamp: new Date().toISOString(), ...optionalParams }));
    }
}

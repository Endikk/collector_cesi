import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Simple structured logger for observability
export const logger = {
    info: (message: string, context?: Record<string, any>) => {
        console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, context }));
    },
    error: (message: string, error?: any, context?: Record<string, any>) => {
        console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, error, context }));
    },
    warn: (message: string, context?: Record<string, any>) => {
        console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, context }));
    },
};

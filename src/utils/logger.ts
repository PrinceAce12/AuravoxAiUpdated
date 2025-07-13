// Production-ready logger utility
import { config } from '../config/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = config.dev.enabled;
  private showDebugInfo = config.dev.showDebugInfo;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return this.showDebugInfo || level >= LogLevel.INFO;
    }
    // In production, only log warnings and errors
    return level >= LogLevel.WARN;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const methods = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
    };

    const method = methods[entry.level] || console.log;
    
    if (entry.data) {
      method(`[${entry.timestamp}] ${entry.message}`, entry.data);
    } else {
      method(`[${entry.timestamp}] ${entry.message}`);
    }
  }

  private logToExternal(entry: LogEntry): void {
    // In production, send errors to external service (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && entry.level >= LogLevel.ERROR && config.sentry.dsn) {
      // This would integrate with your error reporting service
      // Example: Sentry.captureException(entry);
    }
  }

  debug(message: string, data?: any): void {
    const entry = this.formatMessage(LogLevel.DEBUG, message, data);
    this.logToConsole(entry);
  }

  info(message: string, data?: any): void {
    const entry = this.formatMessage(LogLevel.INFO, message, data);
    this.logToConsole(entry);
  }

  warn(message: string, data?: any): void {
    const entry = this.formatMessage(LogLevel.WARN, message, data);
    this.logToConsole(entry);
    this.logToExternal(entry);
  }

  error(message: string, error?: Error | any): void {
    const entry = this.formatMessage(LogLevel.ERROR, message, error);
    this.logToConsole(entry);
    this.logToExternal(entry);
  }

  // Voice-specific logging
  voiceLog(action: string, data?: any): void {
    if (config.features.voiceFeatures) {
      this.debug(`Voice: ${action}`, data);
    }
  }

  // Auth-specific logging
  authLog(action: string, data?: any): void {
    // Be careful not to log sensitive auth data
    const sanitizedData = data ? { ...data, password: '[REDACTED]' } : undefined;
    this.info(`Auth: ${action}`, sanitizedData);
  }

  // Performance logging
  performance(action: string, duration: number): void {
    if (duration > 1000) {
      this.warn(`Performance: ${action} took ${duration}ms`);
    } else {
      this.debug(`Performance: ${action} took ${duration}ms`);
    }
  }
}

export const logger = new Logger();

// Development helper for debugging
if (config.dev.enabled) {
  (window as any).logger = logger;
}

export default logger;

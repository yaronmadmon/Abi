type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  
  /**
   * Debug logs - only shown in development
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext) {
    if (!this.isDev) return
    console.log(`[DEBUG] ${message}`, context || '')
  }
  
  /**
   * Info logs - shown in all environments
   * Use for general informational messages
   */
  info(message: string, context?: LogContext) {
    console.log(`[INFO] ${message}`, context || '')
  }
  
  /**
   * Warning logs - shown in all environments
   * Use for potentially problematic situations
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '')
  }
  
  /**
   * Error logs - shown in all environments
   * Use for error conditions that need attention
   * 
   * @param message - Human-readable error message
   * @param error - Optional Error object
   * @param context - Additional context data
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error(`[ERROR] ${message}`, errorObj, context || '')
    
    // Future: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorTracker({ message, error: errorObj, context })
    // }
  }
  
  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext) {
    switch (level) {
      case 'debug':
        this.debug(message, context)
        break
      case 'info':
        this.info(message, context)
        break
      case 'warn':
        this.warn(message, context)
        break
      case 'error':
        this.error(message, undefined, context)
        break
    }
  }
}

export const logger = new Logger()

/**
 * Centralized Debug Logger
 * 
 * Provides tiered logging levels to reduce console clutter while maintaining
 * visibility into important operations and errors.
 * 
 * Usage:
 * - Set in localStorage: localStorage.setItem('DEBUG_LEVEL', 'DEBUG')
 * - Default: 'INFO' (essential operations only)
 * - Levels: ERROR, WARN, INFO, DEBUG
 * 
 * Examples:
 *   logger.error('Connection', 'Failed to connect:', error);
 *   logger.warn('Playlist', 'Large playlist detected');
 *   logger.info('Playlist', 'Loaded 31K tracks');
 *   logger.debug('Connection', 'Selected:', url);
 */

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const LOG_LEVELS: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  private currentLevel: number;

  constructor() {
    this.currentLevel = this.getLogLevel();
  }

  private getLogLevel(): number {
    const stored = localStorage.getItem('DEBUG_LEVEL') as LogLevel | null;
    const level = stored || 'INFO';
    return LOG_LEVELS[level] ?? LOG_LEVELS.INFO;
  }

  /**
   * Set the current log level
   * @param level - 'ERROR', 'WARN', 'INFO', or 'DEBUG'
   */
  public setLevel(level: LogLevel): void {
    localStorage.setItem('DEBUG_LEVEL', level);
    this.currentLevel = LOG_LEVELS[level];
    console.log(`[Logger] Level set to: ${level}`);
  }

  /**
   * Get the current log level as a string
   */
  public getLevel(): string {
    const entries = Object.entries(LOG_LEVELS);
    const found = entries.find(([_, value]) => value === this.currentLevel);
    return found ? found[0] : 'INFO';
  }

  /**
   * Log an error (always visible)
   */
  public error(context: string, ...args: any[]): void {
    if (this.currentLevel >= LOG_LEVELS.ERROR) {
      console.error(`[${context}]`, ...args);
    }
  }

  /**
   * Log a warning (visible at WARN and above)
   */
  public warn(context: string, ...args: any[]): void {
    if (this.currentLevel >= LOG_LEVELS.WARN) {
      console.warn(`[${context}]`, ...args);
    }
  }

  /**
   * Log important information (visible at INFO and above)
   * Use for: operation start/end, counts, summaries
   */
  public info(context: string, ...args: any[]): void {
    if (this.currentLevel >= LOG_LEVELS.INFO) {
      console.log(`[${context}]`, ...args);
    }
  }

  /**
   * Log debug details (only visible at DEBUG level)
   * Use for: repetitive operations, connection details, state changes
   */
  public debug(context: string, ...args: any[]): void {
    if (this.currentLevel >= LOG_LEVELS.DEBUG) {
      console.log(`[${context}]`, ...args);
    }
  }

  /**
   * Log a grouped operation (collapsible in console)
   * Automatically closes the group after execution
   */
  public group(context: string, label: string, fn: () => void): void {
    if (this.currentLevel >= LOG_LEVELS.DEBUG) {
      console.group(`[${context}] ${label}`);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for global access (useful for debugging in console)
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
}

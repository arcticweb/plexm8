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
declare class Logger {
    private currentLevel;
    constructor();
    private getLogLevel;
    /**
     * Set the current log level
     * @param level - 'ERROR', 'WARN', 'INFO', or 'DEBUG'
     */
    setLevel(level: LogLevel): void;
    /**
     * Get the current log level as a string
     */
    getLevel(): string;
    /**
     * Log an error (always visible)
     */
    error(context: string, ...args: any[]): void;
    /**
     * Log a warning (visible at WARN and above)
     */
    warn(context: string, ...args: any[]): void;
    /**
     * Log important information (visible at INFO and above)
     * Use for: operation start/end, counts, summaries
     */
    info(context: string, ...args: any[]): void;
    /**
     * Log debug details (only visible at DEBUG level)
     * Use for: repetitive operations, connection details, state changes
     */
    debug(context: string, ...args: any[]): void;
    /**
     * Log a grouped operation (collapsible in console)
     * Automatically closes the group after execution
     */
    group(context: string, label: string, fn: () => void): void;
}
export declare const logger: Logger;
export {};

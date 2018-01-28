/**
 * Logging helper module.
 * @module sapim/logger
 */

/**
 * The severity of the message(s) logged.
 * @enum {integer}
 */
export const LOG_LEVEL = {
    /** Debug level */
    DEBUG: 0,
    /** Info level */
    INFO: 1,
    /** Warning level */
    WARNING: 2,
    /** Alias for WARNING */
    WARN: 2,
    /** Erorr level */
    ERROR: 3,
    /** Silent level */
    SILENT: 100
};

/**
 * A simple logging wrapper around the console.
 * @class
 * @property {LOG_LEVEL} level The lowest severity level logged by the logger.
 */
class DefaultLogger {
    constructor() {
        this.level = LOG_LEVEL.INFO;
    }

    /**
     * Log a DEBUG-level message.
     * @param {string} message The message to be logged.
     * @returns {void}
     */
    debug(message) {
        if (this.level <= LOG_LEVEL.DEBUG) {
            console.log(message);
        }
    }

    /**
     * Log a INFO-level message.
     * @param {string} message The message to be logged.
     * @returns {void}
     */
    info(message) {
        if (this.level <= LOG_LEVEL.INFO) {
            console.info(message);
        }
    }

    /**
     * Log a WARN-level message.
     * @param {string} message The message to be logged.
     * @returns {void}
     */
    warn(message) {
        if (this.level <= LOG_LEVEL.WARNING) {
            console.warn(message);
        }
    }

    /**
     * Log a ERROR-level message.
     * @param {string} message The message to be logged.
     * @returns {void}
     */
    error(message) {
        if (this.level <= LOG_LEVEL.ERROR) {
            console.error(message);
        }
    }
}

let logger = new DefaultLogger();

/**
 * Overrides the default logger and sets a custom one (either a "subclass" of the
 * DefaultLogger or an interface-compatible object).
 * @static
 * @param {DefaultLogger|object} customLogger The custom logger object.
 * @returns {void}
 */
export function setLogger(customLogger) {
    logger = customLogger;
}

export default logger;
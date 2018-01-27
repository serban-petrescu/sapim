/**
 * The severity of the message(s) logged.
 * @enum {integer}
 */
let LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    WARN: 2,
    ERROR: 3,
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
 * @param {DefaultLogger|object} customLogger The custom logger object.
 * @returns {void}
 */
function setLogger(customLogger) {
    logger = customLogger;
}

export default logger;
export {LOG_LEVEL, setLogger, DefaultLogger};
/**
 * API management tools module.
 * @module sapim
 */

import ApiManager from "./ApiManager";
import tmp from "tmp";
import {existsSync, readFileSync, writeFile} from "fs-extra";
import {join, resolve} from "path";
import {homedir} from "os";

import logger from "./logger";

tmp.setGracefulCleanup();

/**
 * Utility function for loading a configuration file.
 * @param {string} path The path to the config file.
 * @returns {Configuration} The resulting configuration or null if not found.
 */
export function loadConfigFile(path) {
    try {
        if (existsSync(path)) {
            logger.debug("Loading configuration file: " + path);
            return JSON.parse(readFileSync(path, "utf8"));
        } else {
            logger.debug("No configuration file found at: " + path + ". Skipping.");
            return null;
        }
    } catch (e) {
        logger.warn("Unable to parse .sapim config file from: " + path + ". " + e.toString());
        return null;
    }
}

function getProperty(field, envVar, config) {
    if (process.env[envVar]) {
        logger.debug("Using " + field + " from the environment.");
        return process.env[envVar];
    } else {
        logger.debug("Using " + field + " from the configuration.");
        return config[field];
    }
}

let defaultConfigCache = null;
function defaultConfig() {
    if (!defaultConfigCache) {
        let fileConfig = loadConfigFile(resolve(".sapim")) || loadConfigFile(join(homedir(), ".sapim")) || {};
        defaultConfigCache = {
            username: getProperty("username", "SAPIM_USERNAME", fileConfig),
            password: getProperty("password", "SAPIM_PASSWORD", fileConfig),
            host: getProperty("host", "SAPIM_HOST", fileConfig),
            proxy: getProperty("proxy", "HTTPS_PROXY", fileConfig)
        };
    }
    return defaultConfigCache;
}

/**
 * Creates a .sapim configuration file.
 * @param {Configuration} content The content of the configuration file.
 * @param {boolean} [global=false] Flag indicating if the configuration should be global.
 * @param {boolean} [overwrite=false] Flag indicating if the existing configuration (if any) should
 *  be overwritten.
 */
export function createConfigFile(content, global = false, overwrite = false) {
    let file = global ? join(homedir(), ".sapim") : resolve(".sapim");
    let opts = overwrite ? {flag: "w"} : {flag: "wx"};
    return writeFile(file, JSON.stringify(content, null, 4), opts);
}

/**
 * Factory function for the API tools class.
 * @function default
 * @static
 * @param {Configuration=} config The configuration used for creating the API tools.
 *  If ommited, the configuration is loaded from the environment and / or the file system.
 * @returns {ApiManager} The API tools class instance.
 */
export default function(config = defaultConfig()) {
    return new ApiManager(config);
}

export {
    ApiManager,
    logger
};
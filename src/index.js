import ApiManager from "./ApiManager";
import tmp from "tmp";
import {existsSync, readFileSync} from "fs";
import {join, resolve} from "path";
import {homedir} from "os";

import logger from "./logger";

tmp.setGracefulCleanup();

function loadConfig(path) {
    try {
        if (existsSync(path)) {
            return JSON.parse(readFileSync(path, "utf8"));
        } else {
            return null;
        }
    } catch (e) {
        logger.warn("Unable to parse .sapim config file from: " + path + ". " + e.toString());
        return null;
    }
}

let defaultConfigCache = null;
function defaultConfig() {
    if (!defaultConfigCache) {
        let fileConfig = loadConfig(resolve(".sapim")) || loadConfig(join(homedir(), ".sapim")) || {};
        defaultConfigCache = {
            username: process.env.SAPIM_USERNAME || fileConfig.username,
            password: process.env.SAPIM_PASSWORD || fileConfig.password,
            host: process.env.SAPIM_HOST || fileConfig.host,
            proxy: process.env.HTTPS_PROXY || fileConfig.proxy
        };
    }
    return defaultConfigCache;
}


/**
 * API management tools module.
 * @module sapim
 */

/**
 * Factory function for the API tools class.
 * @function sapim
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
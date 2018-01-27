import ApiManager from "./ApiManager";
import {existsSync, readFileSync} from "fs";
import {join, resolve} from "path";
import {homedir} from "os";

import logger from "./logger";

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

let fileConfig = loadConfig(resolve(".sapim")) || loadConfig(join(homedir(), ".sapim")) || {};

let defaultConfig = {
    username: process.env.SAPIM_USERNAME || fileConfig.username,
    password: process.env.SAPIM_PASSWORD || fileConfig.password,
    host: process.env.SAPIM_HOST || fileConfig.host,
    proxy: process.env.HTTPS_PROXY || fileConfig.proxy
};

export {ApiManager, logger};
export default function(config = defaultConfig) {
    return new ApiManager(config);
}

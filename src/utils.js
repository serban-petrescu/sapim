import {readFile} from "fs-extra";
import {safeLoad} from "js-yaml";
import glob from "glob-promise";
import {sep, normalize, resolve, dirname} from "path";
import copy from "recursive-copy";
import replace from "replace";

import logger from "./logger";

export const PROXY_FOLDER  = "APIProxy";

export function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function iterateThroughPattern(pattern, callback) {
    return glob(pattern, {absolute: true}).then(paths => {
        logger.debug("Expanded pattern " + pattern + " to: " + paths.join(", ") + ".");
        let promise = Promise.resolve();
        for (let i = 0; i < paths.length; ++i) {
            promise = promise.then(() => callback(paths[i]));
        }
        return promise;
    });
}

export function parseManifest(path) {
    var promise = readFile(path);
    if (path.toLowerCase().endsWith(".json")) {
        promise = promise.then(JSON.parse);
    } else {
        promise = promise.then(safeLoad);
    }
    return promise.then(data => {
        if (data && data.proxy) {
            data.proxy.path = resolve(dirname(path), data.proxy.path);
        }
        return data;
    });
}

export function objectToArray(values) {
    let entries = [];
    for (let key in values) {
        if (values.hasOwnProperty(key)) {
            entries.push({
                name: key,
                value: values[key]
            });
        }
    }
    return entries;
}

export function copyAndReplace(source, target, replacements) {
    var promise = source === target ? Promise.resolve() : copy(source, target, {overwrite: true});
    return promise.then(() => {
        for (let i = 0; i < replacements.length; ++i) {
            replace({
                regex: replacements[i].regex,
                replacement: replacements[i].replacement,
                paths: [target],
                recursive: true,
                silent: true,
            });
        }
    });
}

export function endsWith(str, suffix) {
    return str.substring(str.length - suffix.length) === suffix;
}

export function fullPath(path) {
    path = normalize(path);
    if (!endsWith(path, sep)) {
        path += sep;
    }
    if (!endsWith(path, PROXY_FOLDER + sep)) {
        path += PROXY_FOLDER + sep;
    }
    return path;
}
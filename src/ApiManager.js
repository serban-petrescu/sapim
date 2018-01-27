import tmp from "tmp-promise";
import {sep, normalize, join, dirname, resolve, basename} from "path";
import {safeLoad} from "js-yaml";
import fs from "fs";
import mkdirp from "mkdirp";
import glob from "glob-promise";

import logger from "./logger";

import ApiClient from "./ApiClient";
import MapManager from "./MapManager";
import ProxyManager from "./ProxyManager";
import {PROXY_FOLDER} from "./ProxyManager";
import TemplateHelper from "./TemplateHelper";

tmp.setGracefulCleanup();

function endsWith(str, suffix) {
    return str.substring(str.length - suffix.length) === suffix;
}

function fullPath(path) {
    path = normalize(path);
    if (!endsWith(path, sep)) {
        path += sep;
    }
    if (!endsWith(path, PROXY_FOLDER + sep)) {
        path += PROXY_FOLDER + sep;
    }
    return path;
}

function readFileAsync(filename) {
    return new Promise(function (resolve, reject) {
        try {
            fs.readFile(filename, "utf8", function(err, buffer){
                if (err) reject(err); else resolve(buffer);
            });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 * Central class for API Manager related operations.
 */
export default class ApiManager {
    constructor(config) {
        this.client = new ApiClient(config);
    }

    /**
     * Deploys artifacts to the API manager based on a JS object. The object may contain a proxy
     * definition and / or a set of map definitions.
     * @param {object} data The JS object describing the artifacts.
     * @returns {Promise} A promise that is resolved when the operation is done.
     */
    deploy(data) {
        let promise = !data.proxy ? Promise.resolve() : this.deployProxy(data.proxy);
        return data.maps ? promise.then(() => this.deployMaps(data.maps)) : promise;
    }

    /**
     * Deploys artifacts to the API manager based on a YAML manifest. Relative paths
     * (towards the source directory) are resolved based on the YAML's location.
     * @param {string} path The path towards the YAML file. 
     * @returns {Promise} A promise that is resolved when the operation is done.
     */
    deployYaml(path) {
        logger.info("Deploying manifest: " + basename(path) + ".");
        return readFileAsync(path).then(raw => {
            let data = safeLoad(raw);
            if (data.proxy) {
                data.proxy.path = resolve(dirname(path), data.proxy.path);
            }
            return this.deploy(data);
        }).then(() => logger.info("Successfully deployed manifest: " + basename(path) + "."))
            .catch(e => {
                logger.error("Unable to deploy manifest: " + basename(path) + ".");
                throw e;
            });
    }
    
    /**
     * Deploys artifacts zero or more YAML-based manifests to the API Manager.
     * @param {string} globPattern A pattern used to select the manifests.
     * @returns {Promise} A promise that is resolved when the operation is done.
     */
    deployYamls(globPattern) {
        let deploy = path => () => this.deployYaml(path);
        return glob(globPattern, {absolute: true}).then(paths => {
            let promise = Promise.resolve();
            for (let i = 0; i < paths.length; ++i) {
                promise = promise.then(deploy(paths[i]));
            }
            return promise;
        });
    }

    /**
     * Deploys zero or more key-value maps to the API Manager.
     * @param {object} maps A JS object representing the maps. If the values are
     * not strings, they are serialized using the JSON.stringify function.
     * @returns {Promise} A promise that is resolved when the operation is done.
     */
    deployMaps(maps) {
        let promises = [];
        let manager = new MapManager(this.client);
        for (let name in maps) {
            if (maps.hasOwnProperty(name)) {
                promises.push(manager.synchronize(name, maps[name]));
            }
        }
        return Promise.all(promises).then(() => null);
    }

    /**
     * Deploys an API proxy to the API Manager.
     * @param {object} params A wrapper for the method parameters.
     * @param {string} params.path The path to the folder containing the API proxy files.
     * @param {boolean=false} params.templated Flag indicating if the proxy files contain
     * placeholders that need to be replaced before deployment.
     * @param {object} params.placeholders A mapping between the placeholder name and value.
     * @returns {Promise} A promise that is resolved when the operation is done.
     */
    deployProxy({path, templated = false, placeholders}) {
        let full = fullPath(path);
        if (templated) {
            return tmp.dir({unsafeCleanup: true}).then(o => {
                let target = join(o.path, PROXY_FOLDER);
                return new TemplateHelper()
                    .fromTemplate(full, target, placeholders || {})
                    .then(() => this.deployProxy({path: target}))
                    .then(() => o.cleanup());
            });
        } else {
            return new ProxyManager(this.client).upload(full);
        }
    }

    /**
     * Extracts a template from an already existing API proxy.
     * @param {object} params A wrapper for the method parameters.
     * @param {string} params.name The name of the existing API proxy.
     * @param {string} params.path The path where the resulting files should be stored.
     * @param {object} params.placeholders A mapping between the placeholder name and value.
     * This mapping is used to replace placeholder values from the existing API proxy files
     * with the placeholders themselves.
     * @returns A promise that is resolved when the operation is done.
     */
    extractTemplate({name, path, placeholders = {}}) {
        let full = fullPath(path);
        mkdirp.sync(full);
        return new ProxyManager(this.client).download(name, path)
            .then(() => new TemplateHelper().toTemplate(full, full, placeholders))
            .then(() => logger.info("Successfully extracted template from manifest: " + basename(path) + "."));
    }

    /**
     * Extracts a template from an already existing API proxy descibed by a manifest.
     * @param {string} yamlPath The path where the YAML manifest is located.
     * @param {string=} targetPath The path where the resulting files should be stored.
     * If not given, then the results are stored at the path specified in the manifest.
     * @returns A promise that is resolved when the operation is done.
     */
    extractTemplateYaml(yamlPath, targetPath) {
        return readFileAsync(yamlPath).then(raw => { 
            let data = safeLoad(raw);
            if (data.proxy) {
                if (!targetPath) {
                    targetPath = resolve(dirname(yamlPath), data.proxy.path);
                }
                return this.extractTemplate({
                    name: data.proxy.name,
                    path: targetPath,
                    placeholders: data.proxy.placeholders || {}
                });
            } else {
                throw new Error("The specified YAML file has no proxy definition.");
            }
        });
    }
}
import ApiClient from "./ApiClient";

import applyTemplate from "./command/applyTemplate";
import deployManifest, { deployManifestsMatching } from "./command/deployManifest";
import deployProxy from "./command/deployProxy";
import downloadProxy from "./command/downloadProxy";
import extractTemplate, { extractTemplateFromManifest } from "./command/extractTemplate";
import packageManifest, { packageManifestsMatching } from "./command/packageManifest";
import packageProxy, { packageProxyToFile } from "./command/packageProxy";
import updateMap, { updateMapsFromObject } from "./command/updateMap";
import uploadProxy from "./command/uploadProxy";
import { readManifestUrl, readProxyUrl, readVirtualHostById, readDefaultVirtualHost,
    readAllVirtualHosts } from "./command/readInfo";

/**
 * @typedef {object} Configuration
 * @description An object for configuring the API manager tools.
 * @property {string} username The API Portal username used for authentication.
 * @property {string} password The password for the above user.
 * @property {string} host The hostname of the API Portal.
 * @property {string=} proxy Optional (https) proxy server URI.
 */


/**
 * @typedef {object} VirtualHost
 * @description An object containing virtual host information
 * @property {string} id The id of the virtual host.
 * @property {string} name The name of the virtual host.
 * @property {string} url The base url for the virtual host.
 * @property {string} host The hostname of the virtual host.
 * @property {number=} port The port of the virtual host; may be null.
 * @property {boolean} ssl Flag indicating if the host is on SSL.
 * @property {string=} projectPath The project path on the host; may be null.
 * @property {boolean} default Flag indicating if the virtual host is the default one.
 */


/**
 * Public API class for the library.
 * @class
 */
class ApiManager {
    /**
     * Builds a new API Manager toolset class.
     * @constructor
     * @param {Configuration} config
     */
    constructor(config) {
        this.client = new ApiClient(config);
        this.config = config;
    }

    /**
     * Applies the given placeholder values to the template.
     * @param {string} source A directory where the template files are located.
     * @param {string} target The target directory (if it does not exist, it is created).
     * @param {object} placeholders A map between the placeholder names and values (as strings).
     * @param {boolean} [clean=false] Flag indicating if the target directory should be cleaned.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    applyTemplate(source, target, placeholders, clean = false) {
        return applyTemplate(source, target, placeholders, clean);
    }

    /**
     * Deploys the API manager artifacts described in the given manifest.
     * @param {string} path The absolute or relative path of the manifest file.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    deployManifest(path) {
        return deployManifest(this.client, path);
    }

    /**
     * Deploys all the manifests matching the given glob pattern.
     * @param {string} pattern A glob pattern.
     * @param {boolean} [force=false] If true, the method continues execution even if one
     *  manifest deployment fails.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    deployManifestsMatching(pattern, force = false) {
        return deployManifestsMatching(this.client, pattern, force);
    }

    /**
     * Deploys the API manager proxy files located in the given directory.
     * @param {string} path The absolute or relative path of the directory.
     * @param {boolean} [templated=false] Flag indicating if the files are part of a template.
     * @param {object} [placeholders={}] A map between the placeholder names and values (as
     *  strings). Only relevant if templated is set to true.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    deployProxy(path, templated = false, placeholders = {}) {
        return deployProxy(this.client, path, templated, placeholders);
    }

    /**
     * Downloads an existing API Proxy from the API Portal.
     * @param {string} name The name of the existing API proxy.
     * @param {string} path A directory where the results will be stored (if it does not exist,
     *  it is created).
     * @param {boolean} [clean=false] Flag indicating if the target directory should be cleaned.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    downloadProxy(name, path, clean = false) {
        return downloadProxy(this.client, name, path, clean);
    }

    /**
     * Extracts ("reverse-engineers") a template from existing proxy files.
     * @param {string} source A directory where the source files are located.
     * @param {string} target A directory where the results will be stored (if it does not exist,
     *  it is created).
     * @param {object} placeholders A map between the placeholder names and values.
     * @param {boolean} [clean=false] Flag indicating if the target directory should be cleaned.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    extractTemplate(source, target, placeholders, clean = false) {
        return extractTemplate(source, target, placeholders, clean);
    }

    /**
     * Extracts ("reverse-engineers") a template from existing deployed API proxy.
     * @param {string} manifestPath The path to the manifest describing the API proxy.
     * @param {string} target A directory where the results will be stored (if it does not exist,
     *  it is created).
     * @param {boolean} [clean=false] Flag indicating if the target directory should be cleaned.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    extractTemplateFromManifest(manifestPath, target, clean = false) {
        return extractTemplateFromManifest(this.client, manifestPath, target, clean);
    }

    /**
     * Returns the configured API Manager host.
     * @returns {string} The host of the API Manager.
     */
    getConfiguredHost() {
        return this.config.host;
    }

    /**
     * Reads the full base URL for a given API proxy.
     * @param {string} name The name of the API proxy.
     * @returns {Promise} A promise which resolves with the URL as a string.
     */
    getProxyUrl(name) {
        return readProxyUrl(this.client, name);
    }

    /**
     * Reads the full base URL for a proxy described by the given manifest.
     * @param {string} path The path of the manifest file.
     * @returns {Promise} A promise which resolves with the URL as a string.
     */
    getManifestUrl(path) {
        return readManifestUrl(this.client, path);
    }

    /**
     * Reads the information for a virtual host (given by id).
     * @param {string} id The id of the host.
     * @returns {Promise<VirtualHost>} A promise which resolves with the virtual host information.
     */
    getVirtualHostInfoById(id) {
        return readVirtualHostById(this.client, id);
    }

    /**
     * Reads the information for the default virtual hosts.
     * @returns {Promise<VirtualHost>} A promise which resolves with the virtual host information.
     */
    getDefaultVirtualHostInfo() {
        return readDefaultVirtualHost(this.client);
    }

    /**
     * Reads the information for the all virtual hosts.
     * @returns {Promise<VirtualHost[]>} A promise which resolves with the virtual host information.
     */
    getAllVirtualHostInfo() {
        return readAllVirtualHosts(this.client);
    }

    /**
     * Packages an API proxy described by the given manifest into an archive.
     * @param {string} manifestPath The path to the manifest describing the API proxy.
     * @param {string} target The path (including the filename) where to store the zip file.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    packageManifest(manifestPath, target) {
        return packageManifest(manifestPath, target);
    }

    /**
     * Packages all the manifests matched by the given glob pattern.
     * @param {string} pattern The glob pattern to be expanded.
     * @param {boolean} [force=false] If true, the method continues execution even if one
     *  operation fails.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    packageManifestsMatching(pattern, force = false) {
        return packageManifestsMatching(pattern, force);
    }

    /**
     * Packages the API proxy files located at the given directory into a zip stream.
     * @param {string} path The path to the directory containing the proxy files.
     * @param {boolean} [templated=false] Flag indicating if the files are part of a template.
     * @param {object} [placeholders={}] A map between the placeholder names and values (as
     *  strings). Only relevant if templated is set to true.
     * @returns {Promise} A promise that is resolved when the operation has finised. The
     *  Promise will return a stream containing the zip archive when resolved.
     */
    packageProxy(path, templated = false, placeholders = {}) {
        return packageProxy(path, templated, placeholders);
    }

    /**
     * Packages the API proxy files located at the given directory into a zip file.
     * @param {string} path The path to the directory containing the proxy files.
     * @param {string} target The path (including the filename) where to store the zip file.
     * @param {boolean} [templated=false] Flag indicating if the files are part of a template.
     * @param {object} [placeholders={}] A map between the placeholder names and values (as
     *  strings). Only relevant if templated is set to true.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    packageProxyToFile(path, target, templated = false, placeholders = {}) {
        return packageProxyToFile(path, target, templated, placeholders);
    }

    /**
     * Update a key-value map on the API Manager. If the map does not exist, it is created.
     * @param {string} name The name of the key-value map.
     * @param {object} keys A map between the keys and the values. If a given value is
     *  a string, then it is sent as-is to the API Manager. Otherwise, it is serialized
     *  into JSON.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    updateMap(name, keys) {
        return updateMap(this.client, name, keys);
    }
    /**
     * Updates several key-value maps on the API Manager.
     * @see updateMap
     * @param {object} maps A map between the key-value map name and the keys.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    updateMapsFromObject(maps) {
        return updateMapsFromObject(this.client, maps);
    }

    /**
     * Uploads an API Proxy archive to the API Portal.
     * @param {string|stream} pathOrStream Either the path to a zip file or a stream
     *  containing the archive.
     * @returns {Promise} A promise that is resolved when the operation has finised.
     */
    uploadProxy(pathOrStream) {
        return uploadProxy(this.client, pathOrStream);
    }
}

export default ApiManager;
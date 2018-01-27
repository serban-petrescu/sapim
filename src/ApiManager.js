import ApiClient from "./ApiClient";

import applyTemplate from "./command/applyTemplate";
import deployManifest, {deployManifestsMatching} from "./command/deployManifest";
import deployProxy from "./command/deployProxy";
import downloadProxy from "./command/downloadProxy";
import extractTemplate, {extractTemplateFromManifest} from "./command/extractTemplate";
import packageManifest, {packageManifestsMatching} from "./command/packageManifest";
import packageProxy, {packageProxyToFile} from "./command/packageProxy";
import updateMap, {updateMapsFromObject} from "./command/updateMap";
import uploadProxy from "./command/uploadProxy";

/**
 * Public API class for the library.
 */
export default class ApiManager {
    constructor(config) {
        this.client = new ApiClient(config);
    }

    applyTemplate(source, target, placeholders, clean = false) {
        return applyTemplate(source, target, placeholders, clean);
    }

    deployManifest(path) {
        return deployManifest(this.client, path);
    }

    deployManifestsMatching(pattern, force = false) {
        return deployManifestsMatching(this.client, pattern, force);
    }

    deployProxy(path, templated = false, placeholders = {}) {
        return deployProxy(this.client, path, templated, placeholders);
    }

    downloadProxy(name, path, clean = false) {
        return downloadProxy(this.client, name, path, clean);
    }

    extractTemplate(source, target, placeholders, clean = false) {
        return extractTemplate(source, target, placeholders, clean);
    }

    extractTemplateFromManifest(manifestPath, target, clean = false) {
        return extractTemplateFromManifest(this.client, manifestPath, target, clean);
    }

    packageManifest(path, target) {
        return packageManifest(path, target);
    }

    packageManifestsMatching(pattern, force = false) {
        return packageManifestsMatching(pattern, force);
    }

    packageProxy(path, templated = false, placeholders = {}) {
        return packageProxy(path, templated, placeholders);
    }

    packageProxyToFile(path, target, templated = false, placeholders = {}) {
        return packageProxyToFile(path, target, templated, placeholders);
    }

    updateMap(name, keys) {
        return updateMap(this.client, name, keys);
    }

    updateMapsFromObject(maps) {
        return updateMapsFromObject(this.client, maps);
    }

    uploadProxy(pathOrStream) {
        return uploadProxy(this.client, pathOrStream);
    }
}
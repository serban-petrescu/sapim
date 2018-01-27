import {basename} from "path";

import logger from "../logger";
import {parseManifest, iterateThroughPattern} from "../utils";
import deployProxy from "./deployProxy";
import {updateMapsFromObject} from "./updateMap";

export default function deployManifest(client, path) {
    return parseManifest(path).then(({proxy, maps}) => {
        let promise = !proxy ? Promise.resolve() : deployProxy(client, proxy.path,
                proxy.templated, proxy.placeholders);
        return maps ? promise.then(() => updateMapsFromObject(client, maps)) : promise;
    })
    .then(() => logger.info("Successfully deployed manifest: " + basename(path) + "."))
    .catch(e => {
        logger.error("Unable to deploy manifest: " + basename(path) + ". " + e.toString());
        throw new Error("Unable to deploy manifest.");
    });
}

export function deployManifestsMatching(client, pattern, force = false) {
    let wrap = force ? p => p.catch(() => {}) : p => p;
    return iterateThroughPattern(pattern, path => wrap(deployManifest(client, path)));
}
import {basename, parse, join} from "path";

import logger from "../logger";
import {parseManifest, iterateThroughPattern} from "../utils";
import {packageProxyToFile} from "./packageProxy";

function defaultTargetPath(manifestPath) {
    let parsed = parse(manifestPath);
    return join(parsed.dir, parsed.name + ".zip");
}

export default function packageManifest(path, target = defaultTargetPath(path)) {
    return parseManifest(path).then(({proxy}) => {
        if (proxy) {
            return packageProxyToFile(proxy.path, target, proxy.templated, proxy.placeholders);
        } else {
            logger.warn("Manifest " + path + " does not contain any proxy definition.");
            return Promise.resolve();
        }
    })
    .catch(e => {
        logger.error("Unable to create archive for manifest: " + basename(path) + ". " + e.toString());
        throw new Error("Unable to create archive.");
    });
}

export function packageManifestsMatching(pattern, force = false) {
    let wrap = force ? p => p.catch(() => {}) : p => p;
    return iterateThroughPattern(pattern, p => wrap(packageManifest(p)));
}
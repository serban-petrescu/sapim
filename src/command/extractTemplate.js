import {ensureDir, emptyDir} from "fs-extra";

import logger from "../logger";
import {escapeRegExp, copyAndReplace, parseManifest} from "../utils";
import downloadProxy from "./downloadProxy";

function getReplacements(placeholders) {
    let replacements = [];
    for (let key in placeholders) {
        if (placeholders.hasOwnProperty(key)) {
            replacements.push({
                regex: escapeRegExp(placeholders[key]),
                value: placeholders[key],
                replacement: "{{" + key + "}}"
            });
        }
    }
    replacements.sort((a, b) => b.value.length - a.value.length);
    return replacements;
}

export default function extractTemplate(source, target, placeholders, clean = false) {
    return (clean && source !== target ? emptyDir(target) : ensureDir(target))
        .then(() => copyAndReplace(source, target, getReplacements(placeholders)))
        .then(() => logger.debug("Successfully extracted template from: " + source + "."))
        .catch(e => {
            logger.error("Unable to extract template from: " + source + ". " + e.toString());
            throw new Error("Unable to extract template.");
        });
}

export function extractTemplateFromManifest(client, manifestPath, target, clean = false) {
    return parseManifest(manifestPath)
        .then(({proxy}) => {
            if (proxy) {
                target = target || proxy.path;
                return downloadProxy(client, proxy.name, target, clean)
                    .then(() => extractTemplate(target, target, proxy.placeholders || {}));
            } else {
                logger.error("Manifest does not contain any proxy definition: " + target + ".");
                return Promise.reject();
            }
        });
}
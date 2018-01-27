import {ensureDir, emptyDir} from "fs-extra";

import logger from "../logger";
import {escapeRegExp, copyAndReplace} from "../utils";

export default function applyTemplate(source, target, placeholders, clean = false) {
    let replacements = [];
    for (let key in placeholders) {
        if (placeholders.hasOwnProperty(key)) {
            replacements.push({
                regex: escapeRegExp("{{" + key + "}}"),
                replacement: placeholders[key]
            });
        }
    }
    return (clean ? emptyDir(target) : ensureDir(target))
        .then(() => copyAndReplace(source, target, replacements))
        .then(() => logger.debug("Successfully applied template to: " + source + "."))
        .catch(e => {
            logger.error("Unable to apply template to: " + source + ". " + e.toString());
            throw new Error("Unable to apply template to: " + source + ".");
        });
}
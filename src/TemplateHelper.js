import copy from "recursive-copy";
import replace from "replace";

import logger from "./logger";

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export default class TemplateHelper {

    fromTemplate(source, target, placeholders) {
        let replacements = [];
        for (let key in placeholders) {
            if (placeholders.hasOwnProperty(key)) {
                replacements.push({
                    regex: escapeRegExp("{{" + key + "}}"), 
                    replacement: placeholders[key]
                });
            }
        }
        return this.copyAndReplace(source, target, replacements)
            .then(() => logger.debug("Successfully applied template to: " + source + "."))
            .catch(e => {
                logger.error("Unable to apply template to: " + source + ". " + e.toString());
                throw e;
            });
    }
    
    toTemplate(source, target, placeholders) {
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
        return this.copyAndReplace(source, target, replacements)
            .then(() => logger.debug("Successfully extracted template from: " + source + "."))
            .catch(e => {
                logger.error("Unable to extract template from: " + source + ". " + e.toString());
                throw e;
            });
    }

    copyAndReplace(source, target, replacements) {
        var promise = source === target ? Promise.resolve() : copy(source, target);
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

}
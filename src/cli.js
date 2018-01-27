#!/usr/bin/env node

import sapim from "./index";
import program from "commander";
import {version, name, description} from "../package.json";

import logger from "./logger";

function applyOptions() {
    if (program.silent) {
        logger.setLevel("SILENT");
    }
}

function wrapAction(cb) {
    return function(...args) {
        applyOptions();
        try {
            let promise = cb.apply(null, args);
            if (promise && promise.catch) {
                promise.catch(e => logger.error("Operation failed with error: " + e.toString()));
            } 
        } catch (e) {
            logger.error("Operation failed with error: " + e.toString());
            process.exitCode = 1;
        }
    };
}

program.name(name)
    .version(version, "-v, --version")
    .description(description)
    .option("-s, --silent", "suppress console output");

program.command("deploy <manifest_glob>")
    .description("deploy one or more API proxies found using the given glob pattern")
    .action(wrapAction(manifestGlob => sapim().deployYamls(manifestGlob)));

program.command("extract <manifest> [targetDir]")
    .description("extract a template from an already deployed proxy")
    .action(wrapAction((manifest, target) => sapim().extractTemplateYaml(manifest, target)));

program.parse(process.argv);

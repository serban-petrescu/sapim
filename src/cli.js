#!/usr/bin/env node

import sapim from "./index";
import program from "commander";
import {version, name, description} from "../package.json";

import logger, {LOG_LEVEL} from "./logger";

function wrapAction(cb) {
    return function(...args) {
        if (program.silent) {
            logger.level = LOG_LEVEL.SILENT;
        } else if (program.debug) {
            logger.level = LOG_LEVEL.DEBUG;
        }
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

function extractPlaceholders(ph) {
    let placeholders = {};
    for (let i = 0; i < ph.length; ++i) {
        let single = (ph[i] || "").split("=");
        if (single.length === 2) {
            placeholders[single[0].trim()] = single[1].trim();
        }
    }
    return placeholders;
}

program.name(name)
    .version(version, "-v, --version")
    .description(description)
    .option("-s, --silent", "suppress console output")
    .option("-d, --debug", "show debug messages");

program.command("apply-template <source_directory> <target_directory> [placeholders...]")
    .description("applies a template by replacing the given placeholders")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((source, target, ph, options) =>
        sapim().applyTemplate(source, target, extractPlaceholders(ph), options.clean)));

program.command("deploy <manifest>")
    .description("deploy API manager artifacts described by the given manifest")
    .action(wrapAction(manifest => sapim().deployManifest(manifest)));

program.command("deploy-all <pattern>")
    .description("deploy all the manifests matching the given glob pattern")
    .option("-f, --force", "continues execution even if one manifest deployment fails")
    .action(wrapAction((pattern, options) => sapim().deployManifestsMatching(pattern, options.force)));

program.command("deploy-proxy <directory> [placeholders...]")
    .description("deploy the API proxy located in the given directory")
    .action(wrapAction((path, ph) => ph.length > 0 ?
        sapim().deployProxy(path, true, extractPlaceholders(ph)) : sapim().deployProxy(path)));

program.command("download-proxy <proxy_name> <target_directory>")
    .description("download an already existing API proxy from the API Portal")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((name, target, options) => sapim().downloadProxy(name, target, options.clean)));

program.command("extract-template-proxy <source> <target> [placeholders...]")
    .description("extract a template from an existing API proxy")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((source, target, ph, options) =>
        sapim().extractTemplate(source, target, extractPlaceholders(ph), options.clean)));

program.command("extract-template <manifest> [target_directory]")
    .description("extract a template from an already deployed proxy (described by the given manifest)")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((manifest, target, options) =>
        sapim().extractTemplateFromManifest(manifest, target, options.clean)));

program.command("package <manifest> [target_archive]")
    .description("package the API proxy described by the given manifest into an archive")
    .action(wrapAction((path, target) => sapim().packageManifest(path, target)));

program.command("package-all <pattern>")
    .description("package all the API proxies described by the manifests matched by the given pattern")
    .option("-f, --force", "continues execution even if one operation fails")
    .action(wrapAction((path, options) => sapim().packageManifestsMatching(path, options.force)));

program.command("package-proxy <directory> <target_archive> [placeholders...]")
    .description("package the proxy located in the given directory")
    .action(wrapAction((path, target, ph) => ph.length > 0 ?
        sapim().packageProxyToFile(path, target, true, extractPlaceholders(ph)) :
        sapim().packageProxyToFile(path, target)));

program.command("upload-proxy <archive>")
    .description("upload an API proxy as an archive to the API Portal")
    .action(wrapAction(path => sapim().uploadProxy(path)));

program.parse(process.argv);

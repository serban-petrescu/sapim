#!/usr/bin/env node

import sapim, { createConfigFile, loadConfigFile } from "./index";
import program from "commander";
import prompt from "prompt";
import { version, name, description } from "../package.json";
import dotenv from "dotenv";

import logger, { LOG_LEVEL } from "./logger";

function wrapAction(cb) {
    return function (...args) {
        if (program.silent) {
            logger.level = LOG_LEVEL.SILENT;
        } else if (program.debug) {
            logger.level = LOG_LEVEL.DEBUG;
        }
        try {
            let promise = cb.apply(null, args);
            if (promise && promise.catch) {
                promise.catch(e => {
                    logger.error("Operation failed with error: " + e.toString());
                    process.exitCode = 1;
                });
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

function build() {
    if (program.config) {
        return sapim(loadConfigFile(program.config));
    } else if (program.env) {
        dotenv.config({ path: program.env });
        return sapim();
    } else {
        dotenv.config();
        return sapim();
    }
}

program.name(name)
    .version(version, "-v, --version")
    .description(description)
    .option("-s, --silent", "suppress console output")
    .option("-e, --env <path>", "load environment variables from the given file")
    .option("-c, --config <path>", "load the given configuration file")
    .option("-d, --debug", "show debug messages");

program.command("apply-template <source_directory> <target_directory> [placeholders...]")
    .description("applies a template by replacing the given placeholders")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((source, target, ph, options) =>
        build().applyTemplate(source, target, extractPlaceholders(ph), options.clean)));

program.command("deploy <manifest>")
    .description("deploy API manager artifacts described by the given manifest")
    .action(wrapAction(manifest => build().deployManifest(manifest)));

program.command("deploy-all <pattern>")
    .description("deploy all the manifests matching the given glob pattern")
    .option("-f, --force", "continues execution even if one manifest deployment fails")
    .action(wrapAction((pattern, options) => build().deployManifestsMatching(pattern, options.force)));

program.command("deploy-proxy <directory> [placeholders...]")
    .description("deploy the API proxy located in the given directory")
    .action(wrapAction((path, ph) => ph.length > 0 ?
        build().deployProxy(path, true, extractPlaceholders(ph)) : build().deployProxy(path)));

program.command("download-proxy <proxy_name> <target_directory>")
    .description("download an already existing API proxy from the API Portal")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((name, target, options) => build().downloadProxy(name, target, options.clean)));

program.command("extract-template-proxy <source> <target> [placeholders...]")
    .description("extract a template from an existing API proxy")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((source, target, ph, options) =>
        build().extractTemplate(source, target, extractPlaceholders(ph), options.clean)));

program.command("extract-template <manifest> [target_directory]")
    .description("extract a template from an already deployed proxy (described by the given manifest)")
    .option("-c, --clean", "clean the target directory first")
    .action(wrapAction((manifest, target, options) =>
        build().extractTemplateFromManifest(manifest, target, options.clean)));

program.command("get-proxy-url <name>")
    .description("retrieves the base URL for the given proxy")
    .action(wrapAction(name => build().getProxyUrl(name).then(s => console.log(s))));

program.command("get-manifest-url <path>")
    .description("retrieves the base URL for the proxy described by the given manifest")
    .action(wrapAction(path => build().getManifestUrl(path).then(s => console.log(s))));

program.command("get-vhost-info")
    .description("retrieves the information pertaining virtual host(s); without any options, retrieves the default vhost")
    .option("-i, --id <id>", "uses the given id to select the vhost")
    .option("-a, --all", "retrieves all the virtual hosts available")
    .action(wrapAction(command => {
        let result;
        if (command.id) {
            result = build().getVirtualHostInfoById(command.id);
        } else if (command.all) {
            result = build().getAllVirtualHostInfo();
        } else {
            result = build().getDefaultVirtualHostInfo();
        }
        return result.then(info => console.log(JSON.stringify(info, null, 4)));
    }));

program.command("package <manifest> [target_archive]")
    .description("package the API proxy described by the given manifest into an archive")
    .action(wrapAction((path, target) => build().packageManifest(path, target)));

program.command("package-all <pattern>")
    .description("package all the API proxies described by the manifests matched by the given pattern")
    .option("-f, --force", "continues execution even if one operation fails")
    .action(wrapAction((path, options) => build().packageManifestsMatching(path, options.force)));

program.command("package-proxy <directory> <target_archive> [placeholders...]")
    .description("package the proxy located in the given directory")
    .action(wrapAction((path, target, ph) => ph.length > 0 ?
        build().packageProxyToFile(path, target, true, extractPlaceholders(ph)) :
        build().packageProxyToFile(path, target)));

program.command("upload-proxy <archive>")
    .description("upload an API proxy as an archive to the API Portal")
    .action(wrapAction(path => build().uploadProxy(path)));

program.command("config")
    .description("configure the sapim library (create a .sapim file)")
    .option("-g, --global", "creates the file globally (in the home dir)")
    .option("-f, --force", "overwrites any existing configuration")
    .action(wrapAction(options => {
        prompt.start({ message: "" });
        return new Promise((resolve, reject) => {
            prompt.get({
                properties: {
                    host: {
                        description: "API portal hostname",
                        required: true
                    },
                    username: {
                        description: "API portal username",
                        required: true
                    },
                    password: {
                        description: "API portal password",
                        hidden: true,
                        required: true
                    },
                    proxy: {
                        description: "HTTPS proxy (optional)",
                        required: false
                    }
                }
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).then(content => createConfigFile(content, options.global, options.force));
    }));

program.parse(process.argv);

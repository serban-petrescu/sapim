import archiver from "archiver";
import streamToPromise from "stream-to-promise";
import tmp from "tmp-promise";
import {join, dirname} from "path";
import {createWriteStream, ensureDir} from "fs-extra";

import applyTemplate from "./applyTemplate";
import {PROXY_FOLDER, fullPath} from "../utils";
import logger from "../logger";

function toZip(path) {
    let archive = archiver("zip");
    archive.directory(path, "/" + PROXY_FOLDER);
    archive.finalize();
    return archive;
}

export function packageProxyToFile(source, target, templated = false, placeholders = {}) {
    return ensureDir(dirname(target))
        .then(() => packageProxy(source, templated, placeholders))
        .then(stream => streamToPromise(stream.pipe(createWriteStream(target))))
        .then(() => logger.debug("Successfully packaged proxy " + source + "."));
}

export default function packageProxy(path, templated = false, placeholders = {}) {
    let full = fullPath(path);
    if (templated) {
        return tmp.dir({unsafeCleanup: true}).then(o => {
            let temp = join(o.path, PROXY_FOLDER);
            return applyTemplate(full, temp, placeholders)
                .then(() => {
                    let stream = toZip(temp);
                    streamToPromise(stream).then(() => o.cleanup());
                    return stream;
                });
        });
    } else {
        return Promise.resolve(toZip(full));
    }
}
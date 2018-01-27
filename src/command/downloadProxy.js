import {ensureDir, emptyDir} from "fs-extra";
import streamToPromise from "stream-to-promise";
import unzip from "unzip-stream";
import MemoryStream from "memorystream";

import logger from "../logger";

export default function downloadProxy(client, name, path, clean = false) {
    let directory = clean ? emptyDir(path) : ensureDir(path);
    return directory.then(() => client.downloadProxy(name))
            .then(binary => streamToPromise(new MemoryStream(binary).pipe(unzip.Extract({path}))))
            .then(() => logger.info("Successfully downloaded API Proxy archive."));
}
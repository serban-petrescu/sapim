import archiver from "archiver";
import {encode} from "base64-stream";
import MemoryStream from "memorystream";
import unzip from "unzip-stream";
import streamToPromise from "stream-to-promise";

import logger from "./logger";

export const PROXY_FOLDER  = "APIProxy";

export default class ProxyManager {
    constructor(client) {
        this.client = client;
    }

    upload(path) {
        let archive = archiver("zip");
        let stream = new MemoryStream();
        archive.pipe(encode()).pipe(stream);
        archive.directory(path, "/" + PROXY_FOLDER);
        archive.finalize();
        return this.client.uploadProxy(stream)
            .then(() => logger.info("Successfully uploaded API Proxy archive."));
    }

    download(name, path) {
        return this.client.downloadProxy(name)
            .then(({stream}) => streamToPromise(stream.pipe(unzip.Extract({path}))))
            //.then(binary => streamToPromise(new MemoryStream(binary).pipe(unzip.Extract({path}))))
            .then(() => logger.info("Successfully downloaded API Proxy archive."));
    }
}
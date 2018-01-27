import {createReadStream} from "fs";
import {encode} from "base64-stream";

import logger from "../logger";

function fileToStream(path) {
    try {
        return Promise.resolve(createReadStream(path));
    } catch (e) {
        logger.error("Failed to upload zip file. " + e.toString());
        throw new Error("Failed to upload zip file.");
    }
}

export default function uploadProxy(client, pathOrStream) {
    let promise = (typeof pathOrStream === "string") ? fileToStream(pathOrStream) : Promise.resolve(pathOrStream);
    return promise.then(stream => client.uploadProxy(stream.pipe(encode()))
        .then(() => logger.debug("Successfully uploaded API Proxy archive.")));
}
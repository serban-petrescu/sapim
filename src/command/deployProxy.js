import packageProxy from "./packageProxy";
import uploadProxy from "./uploadProxy";
import logger from "../logger";

export default function deployProxy(client, path, templated, placeholders) {
    return packageProxy(path, templated, placeholders)
        .then(stream => uploadProxy(client, stream))
        .then(() => logger.debug("Succesfully deployed proxy: " + path + "."));
}


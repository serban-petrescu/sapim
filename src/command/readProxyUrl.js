import logger from "../logger";
import {parseManifest} from "../utils";

function findDefault(array) {
    if (array) {
        for (var i = 0; i < array.length; ++i) {
            if (array[i].isDefault) {
                return array[i];
            }
        }
    }
    logger.error("Unable to parse API Management OData response; could not find default object.");
    throw new Error("Unable to parse API Management OData response.");
}

export default function readProxyUrl (client, name) {
    return client.readProxyInfo(name).then(info => {
        logger.debug("Got information for proxy:" + name + ".");
        var proxy = findDefault(info.proxyEndPoints.results);
        var host = findDefault(proxy.virtualhosts.results);
        return (host.isSSL ? "https://" : "http://") + host.virtual_host + ":" + host.virtual_port + proxy.base_path;
    });
}

export function readManifestUrl(client, path) {
    return parseManifest(path).then(manifest => readProxyUrl(client, manifest.proxy.name));
}
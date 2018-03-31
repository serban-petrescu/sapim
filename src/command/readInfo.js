import logger from "../logger";
import { parseManifest } from "../utils";

function findDefault(array) {
    if (array) {
        for (let i = 0; i < array.length; ++i) {
            if (array[i].isDefault) {
                return array[i];
            }
        }
    }
    logger.error("Unable to parse API Management OData response; could not find default object.");
    throw new Error("Unable to parse API Management OData response.");
}

function findById(array, id) {
    if (array) {
        for (let i = 0; i < array.length; ++i) {
            if (array[i].id === id) {
                return array[i];
            }
        }
    }
    logger.error("Unable to parse API Management OData response; could not find object with id: " + id + ".");
    throw new Error("Unable to parse API Management OData response.");
}

function nonStartingSlash(uri) {
    return uri.indexOf("/") === 0 ? uri.substr(1) : uri;
}

function vhostToUrl(vhost) {
    let result = (vhost.isSSL ? "https://" : "http://") + vhost.virtual_host;
    if (vhost.virtual_port) {
        result += ":" + vhost.virtual_port;
    }
    result += "/";
    if (vhost.projectPath) {
        result += nonStartingSlash(vhost.projectPath) + "/";
    }
    return result;
}

function parseVirtualHost(vhost) {
    return {
        url: vhostToUrl(vhost),
        ssl: vhost.isSSL || false,
        id: vhost.id,
        name: vhost.name,
        default: vhost.isDefault,
        host: vhost.virtual_host,
        port: vhost.virtual_port || null,
        projectPath: vhost.projectPath || null
    };
}

export function readAllVirtualHosts(client) {
    return client.readVirtualHosts().then(info => {
        logger.debug("Got vhost information and retrieved all vhosts.");
        let result = [];
        for (let vhost of info) {
            result.push(parseVirtualHost(vhost));
        }
        return result;
    });
}

export function readVirtualHostById(client, id) {
    return client.readVirtualHosts().then(info => {
        let vhost = findById(info, id);
        logger.debug("Got vhost information and retrieved vhost with id: " + id + ".");
        return parseVirtualHost(vhost);
    });
}

export function readDefaultVirtualHost(client, id) {
    return client.readVirtualHosts().then(info => {
        let vhost = findDefault(info, id);
        logger.debug("Got vhost information for default vhost.");
        return parseVirtualHost(vhost);
    });
}

export function readProxyUrl(client, name) {
    return client.readProxyInfo(name).then(info => {
        logger.debug("Got information for proxy:" + name + ".");
        let proxy = findDefault(info.proxyEndPoints.results);
        let host = findDefault(proxy.virtualhosts.results);
        return vhostToUrl(host) + nonStartingSlash(proxy.base_path);
    });
}

export function readManifestUrl(client, path) {
    return parseManifest(path).then(manifest => readProxyUrl(client, manifest.proxy.name));
}
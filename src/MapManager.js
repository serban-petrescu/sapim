import logger from "./logger";

function recreate(client, name, entries) {
    return client.deleteMap(name)
        .then(() => client.createMap(name, {name, keyMapEntryValues: entries}));
}

function toEntriesArray(name, values) {
    let entries = [];
    for (let key in values) {
        if (values.hasOwnProperty(key)) {
            let value = typeof values[key] === "string" ? values[key] : JSON.stringify(values[key]);
            entries.push({
                name: key,
                map_name: name,
                value
            });
        }
    }
    return entries;
}

export default class MapManager {
    constructor(client) {
        this.client = client;
    }

    synchronize(name, values) {
        return recreate(this.client, name, toEntriesArray(name, values))
            .then(() => logger.info("Successfully synchronized map: " + name + "."))
            .catch(e => {
                logger.error("Unable to synchronize map: " + name + ".");
                throw e;
            });
    }
}
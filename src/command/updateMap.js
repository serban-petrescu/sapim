import {objectToArray} from "../utils";
import logger from "../logger";

function toEntriesArray(name, values) {
    let array = objectToArray(values);
    for (let i = 0; i < array.length; ++i) {
        array[i].value = typeof array[i].value === "string" ? array[i].value : JSON.stringify(array[i].value);
        array[i].map_name = name;
    }
    return array;
}

function recreateMap(client, name, entries) {
    return client.deleteMap(name)
        .then(() => client.createMap(name, {name, keyMapEntryValues: entries}));
}

export default function updateMap(client, name, keys) {
    return recreateMap(client, name, toEntriesArray(name, keys))
        .then(() => logger.debug("Successfully updated map " + name + "."));
}

export function updateMapsFromObject(client, maps) {
    let promises = [];
    for (let key in maps) {
        if (maps.hasOwnProperty(key)) {
            promises.push(updateMap(client, key, maps[key]));
        }
    }
    return Promise.all(promises);
}
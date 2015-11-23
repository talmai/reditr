import localforage from 'localforage';

class DataStore {

    constructor() {
        localforage.config({
            name        : 'Reditr',
            version     : 1.0,
            storeName   : 'keyvaluepairs'
        });

        console.log(localforage);
    }

    createInstance(name) {
        // want to segment localstorage, so don't create global buckets
        if (!name || name == "") {
            return;
        }

        return localforage.createInstance({
          name: name
        });
    }

}

export default new DataStore;

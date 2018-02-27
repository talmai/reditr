import DataStore from '../utilities/DataStore';

class BaseModel {

    constructor(json) {
        this.json = json;

        this.enableCaching = false;
        this.cacheName = "base_model";
    }

    startCaching(cacheName) {
        this.enableCaching = true;
        this.cacheName = cacheName;

        this.dataStore = DataStore.createInstance(this.cacheName);
    }

    stopCaching() {
        this.enableCaching = false;
    }

    get(prop) {
        return this.json ? this.json.data[prop] : undefined;
    }

}

export default BaseModel;

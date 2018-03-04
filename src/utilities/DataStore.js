import localforage from 'localforage';
import DataStoreChild from './DataStoreChild';

class DataStore {

  constructor() {
    localforage.config({
      driver    : localforage.LOCALSTORAGE,
      name    : 'Reditr',
      version   : 1.0,
      storeName   : 'keyvaluepairs'
    });
  }

  createInstance(name) {
    // want to segment localstorage, so don't create global buckets
    if (!name || name == "") {
      return;
    }

    return new DataStoreChild(name, localforage);
  }

}

export default new DataStore;

class DataStoreChild {
  constructor(name, localforageInstance) {
    this.dataStore = localforageInstance.createInstance({
      name: name
    })

    // set config
    this.dataStore.config({
      driver: localforageInstance.LOCALSTORAGE
    })
  }

  get(items, callback) {
    // check if array
    if (Array.isArray(items)) {
      let promises = items.map(item => {
        return this.dataStore.getItem(item)
      })
      Promise.all(promises).then(callback)
    } else if (typeof items == 'string') {
      // assume only one object is needed
      this.dataStore.getItem(items, callback)
    }
  }

  set(key, value, callback) {
    this.dataStore.setItem(key, value, callback)
  }
}

export default DataStoreChild

class BaseModel {

    constructor(postJson) {
        this.json = postJson
    }

    get(prop) {
        return this.json.data[prop]
    }

}

export default BaseModel

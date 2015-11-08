class BaseModel {

    constructor(postJson) {
        this.json = postJson;
    }

    get(prop) {
        return this.json ? this.json.data[prop] : undefined;
    }

}

export default BaseModel;

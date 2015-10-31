class PostModel {

    constructor(postJson) {
        this.json = postJson
    }

    get(prop) {
        return this.json.data[prop]
    }

}

export default PostModel

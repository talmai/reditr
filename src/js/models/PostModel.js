import BaseModel from './BaseModel.js'

class PostModel extends BaseModel {
    // post specific methods here
    get kind() {
        return this.json.kind;
    }

}

export default PostModel

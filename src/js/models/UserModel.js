import BaseModel from './BaseModel';

class UserModel extends BaseModel {
    constructor(model) {
        super();

        if (typeof model == "object") {
            for (let property in model) {
                if (model.hasOwnProperty(property)) {
                    this[property] = model[property];
                }
            }
        } else {
            this.name = "";
            this.refreshKey = "";
            this.accessToken = "";
        }
    }

    get username() {
        return this.name;
    }

    set username(n) {
        this.name = n;
        this.startCaching(this.name);
    }
}

export default UserModel

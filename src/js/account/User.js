import OAuth from '../api/OAuth';
import UserModel from '../models/UserModel';
import reddit from '../api/reddit';

class User {

    constructor(refreshKey) {
        this.refreshKey = refreshKey;
        this.accessToken = "";
    }

    me() {
        reddit.getCurrentAccountInfo((err, response) => {
            console.log(response);
        });
    }
}

export default User

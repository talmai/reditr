import OAuth from '../api/OAuth';
import UserModel from '../models/UserModel';
import reddit from '../api/reddit';
import UserSettings from './UserSettings';

class User {

    constructor(refreshKey) {
        this.refreshKey = refreshKey;
        this.accessToken = "";
        this.userName = "";
    }

    me() {
        reddit.getCurrentAccountInfo((err, response) => {
            this.dataStore = new UserSettings(this);
            console.log(response);
        });
    }
}

export default User

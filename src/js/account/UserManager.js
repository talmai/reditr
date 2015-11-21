import OAuth from '../api/OAuth';
import User from './User';
import reddit from '../api/reddit';

class UserManager {

    constructor() {
        this.users = [];
    }

    startLogin(callback) {
        OAuth.start(data => {
            let status = data.status;

            if (status == "success") {
                let user = new User(data.refreshkey);

                OAuth.getAccessToken(user, accessToken => {
                    user.accessToken = accessToken;
                    this.addAccount(user);
                    callback("success", user);
                });
            } else if (status == "waiting") {
                callback("error");
            } else {
                callback("error");
            }
        });
    }

    addAccount(user) {
        reddit.setAuth(user);
        user.me();
        this.users.push(user);
    }

}

export default new UserManager

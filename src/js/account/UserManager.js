import OAuth from '../api/OAuth';
import User from './User';
import reddit from '../api/reddit';
import DataStore from '../utilities/DataStore';
import Observable from '../utilities/Observable';

class UserManager {

    constructor() {
        this.dataStore = DataStore.createInstance("UserManager");

        this.users = {};
        this.currentUser = null;

        this.isInitialized = false;

        this.dataStore.get(["users", "currentUser"], (results) => {
            for (user in this.users) {
                let user = new User(user);
                this.users[user.username] = user;
            }

            if (results[1]) {
                this.setCurrentUser(new User(results[1]));
            } else {
                // notify that we are ready
                this.isInitialized = true;
                Observable.global.trigger("UserManagerInitialized", this);
            }
        });
    }

    startLogin(callback) {
        this.finalCallback = callback;

        OAuth.start(data => {
            let status = data.status;

            if (status == "success") {
                let user = new User(data.refreshkey);

                OAuth.getAccessToken(user, accessToken => {
                    user.accessToken = accessToken;

                    // we have an access token, so we can finally add the user
                    this.addAccount(user);
                });
            } else if (status == "waiting") {
                this.finalCallback("error");
            } else {
                this.finalCallback("error");
            }
        });
    }

    setCurrentUser(user) {
        if (user != null) {
            this.currentUser = new User(user);
        } else {
            this.currentUser = user;
        }

        OAuth.getAccessToken(user, accessToken => {
            user.accessToken = accessToken;

            // make sure we set reddit auth for requests to work
            reddit.setAuth(user);

            // save
            this.dataStore.set("currentUser", user);

            // notify that we have a new user to update UI
            Observable.global.trigger('updateCurrentUser', { user: user });

            if (!this.isInitialized) {                
                // notify that we are ready
                this.isInitialized = true;
                Observable.global.trigger("UserManagerInitialized", this);
            }
        });

    }

    logout() {
        this.setCurrentUser(null);
    }

    addAccount(user) {
        // make sure we set reddit auth for requests to work
        reddit.setAuth(user);

        // get user info
        user.me(() => {
            // add and save
            this.users[user.username] = user;
            this.dataStore.set("users", this.users);

            // assume the account you added will be the current user
            this.setCurrentUser(user);

            // done so callback
            this.finalCallback("success", user);
            this.finalCallback = null;
        });
    }



}

export default new UserManager;

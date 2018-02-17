import OAuth from '../api/OAuth';
import UserModel from '../models/UserModel';
import reddit from '../api/reddit';
import UserSettings from './UserSettings';

class User {

  constructor(refreshKey) {
    if (typeof refreshKey == "object") {
      // we have an user object, not a refreshkey
      let user = refreshKey;

      this.model = new UserModel(user.model);
      this.userSettings = new UserSettings(user);
    } else {
      // we got a refresh key, build some scaffolding
      this.model = new UserModel();
      this.username = "";
      this.refreshKey = refreshKey;
      this.accessToken = "";
      this.userSettings = null;
    }
  }

  me(callback) {
    reddit.getCurrentAccountInfo((err, response) => {
      let me = response.body;
      this.username = me.name;
      this.modhash = me.modhash;
      // get/create userSettings
      this.userSettings = new UserSettings(this);
      // done
      callback();
    });

  }

  get username() {
    return this.model.username;
  }

  set username(n) {
    this.model.username = n;
  }

  get accessToken() {
    return this.model.accessToken;
  }

  set accessToken(n) {
    this.model.accessToken = n;
  }

  get refreshKey() {
    return this.model.refreshKey;
  }

  set refreshKey(n) {
    this.model.refreshKey = n;
  }
}

export default User;

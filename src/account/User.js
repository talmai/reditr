import OAuth from '../api/OAuth';
import reddit from '../api/reddit';
import UserSettings from './UserSettings';

class User {

  constructor(refreshKey) {
    if (typeof refreshKey == "object") {
      // we have an user object, not a refreshkey
      let user = refreshKey;
      
      Object.keys(user).forEach(key => {
        this[key] = user[key]
      })

      this.userSettings = new UserSettings(user);
    } else {
      // we got a refresh key, build some scaffolding
      this.username = "";
      this.refreshKey = refreshKey;
      this.accessToken = "";
      this.userSettings = null;
    }
  }

  me() {
    // TODO: model objects should not have service requests, move to user manager
    return new Promise((resolve, reject) => {
      reddit.getCurrentAccountInfo().then(response => {
        const me = response
        this.username = me.name;
        this.modhash = me.modhash;
        // get/create userSettings
        this.userSettings = new UserSettings(this);

        resolve()
      }).catch(reject)
    })
  }
}

export default User;

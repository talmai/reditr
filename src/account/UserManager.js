import OAuth from '../api/OAuth'
import User from './User'
import reddit from '../api/reddit'
import DataStore from '../utilities/DataStore'

export default class UserManager {
  constructor() {
    this.dataStore = DataStore.createInstance('UserManager')

    this.users = {}
    this.currentUser = null

    this.isInitialized = false
  }

  getCurrentUser() {
    return new Promise((resolve, reject) => {
      if (this.currentUser) resolve(this.currentUser)

      this.dataStore.get(['users', 'currentUser'], results => {
        if (results[1]) {
          this.setCurrentUser(new User(results[1])).then(resolve)
        } else {
          this.setCurrentUser(new User()).then(resolve)
        }
      })
    })
  }

  startLogin() {
    return new Promise((resolve, reject) => {
      OAuth.start().then(data => {
        let status = data.status

        if (status == 'success') {
          let user = new User(data.refreshkey)

          OAuth.getAccessToken(user).then(accessToken => {
            user.accessToken = accessToken

            // we have an access token, so we can finally add the user
            this.addAccount(user).then(resolve)
          })
        } else {
          resolve('error')
        }
      })
    })
  }

  setCurrentUser(user) {
    return new Promise((resolve, reject) => {
      if (user !== null) {
        this.currentUser = new User(user)
      } else {
        this.currentUser = user
      }

      // if user is null, stop here so we do not get the refresh token
      if (user) {
        OAuth.getAccessToken(user).then(accessToken => {
          user.accessToken = accessToken

          // make sure we set reddit auth for requests to work
          reddit.setAuth(user)

          // save
          this.dataStore.set('currentUser', user)

          if (!this.isInitialized) {
            // notify that we are ready
            this.isInitialized = true
          }
        })
      } else {
        // make sure we set reddit auth for requests to work
        reddit.setAuth(user)

        // save
        this.dataStore.set('currentUser', user)
      }

      resolve(this.currentUser)
    })
  }

  addAccount(user) {
    return new Promise((resolve, reject) => {
      // make sure we set reddit auth for requests to work
      reddit.setAuth(user)

      // get user info
      user.me().then(() => {
        // add and save
        this.users[user.username] = user
        this.dataStore.set('users', this.users)

        // assume the account you added will be the current user
        this.setCurrentUser(user).then(() => {
          // done so callback
          resolve({ status: 'success', user })
        })
      })
    })
  }

  logout() {
    return this.setCurrentUser(new User())
  }
}

import React from 'react'
import OAuth from '../api/OAuth'
import User from './User'
import reddit from '../api/reddit'
import DataStore from '../utilities/DataStore'
import Observable from '../utilities/Observable'

class UserManager {
  constructor() {
    this.dataStore = DataStore.createInstance('UserManager')

    this.users = {}
    this.currentUser = null

    this.isInitialized = false
  }

  getCurrentUser() {
    return new Promise((resolve, reject) => {
      this.dataStore.get(['users', 'currentUser'], results => {
        if (results[1]) {
          this.setCurrentUser(new User(results[1]), resolve)
        } else {
          this.setCurrentUser(new User(), resolve)
        }
      })
    })
  }

  startLogin(callback) {
    this.finalCallback = callback

    OAuth.start(data => {
      let status = data.status

      if (status == 'success') {
        let user = new User(data.refreshkey)

        OAuth.getAccessToken(user, accessToken => {
          user.accessToken = accessToken

          // we have an access token, so we can finally add the user
          this.addAccount(user)
        })
      } else if (status == 'waiting') {
        this.finalCallback('error')
      } else {
        this.finalCallback('error')
      }
    })
  }

  setCurrentUser(user, callback = () => {}) {
    if (user !== null) {
      this.currentUser = new User(user)
    } else {
      this.currentUser = user
    }

    // if user is null, stop here so we do not get the refresh token
    if (user) {
      OAuth.getAccessToken(user, accessToken => {
        user.accessToken = accessToken

        // make sure we set reddit auth for requests to work
        reddit.setAuth(user)

        // save
        this.dataStore.set('currentUser', user)

        // notify that we have a new user to update UI
        Observable.global.trigger('updateCurrentUser', { user: user })

        if (!this.isInitialized) {
          // notify that we are ready
          this.isInitialized = true
          Observable.global.trigger('UserManagerInitialized', this)
        }
      })
    } else {
      // make sure we set reddit auth for requests to work
      reddit.setAuth(user)

      // save
      this.dataStore.set('currentUser', user)

      // notify that we have no user
      Observable.global.trigger('updateCurrentUser', { user: user })
    }

    callback(this.currentUser)
  }

  addAccount(user) {
    // make sure we set reddit auth for requests to work
    reddit.setAuth(user)

    // get user info
    user.me().then(() => {
      // add and save
      this.users[user.username] = user
      this.dataStore.set('users', this.users)

      // assume the account you added will be the current user
      this.setCurrentUser(user)

      // done so callback
      this.finalCallback('success', user)
      this.finalCallback = null
    })
  }

  logout() {
    this.setCurrentUser(null)
  }
}

const UserContext = React.createContext({ user: null, userManager: null })
class UserProvider extends React.Component {
  constructor(props) {
    super(props)

    this.userManager = new UserManager()

    this.state = {
      currentUser: null
    }
  }

  componentDidMount() {
    this.userManager.getCurrentUser().then(user => {
      this.setState({ currentUser: user })
    })
  }

  render() {
    return <UserContext.Provider value={{ user: this.state.currentUser, userManager: this.userManager }}>{this.props.children}</UserContext.Provider>
  }
}

export { UserProvider, UserContext }

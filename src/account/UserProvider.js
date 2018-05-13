import React from 'react'
import OAuth from '../api/OAuth'
import User from './User'
import reddit from '../api/reddit'
import DataStore from '../utilities/DataStore'
import Observable from '../utilities/Observable'

const UserContext = React.createContext({ user: null })
class UserProvider extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentUser: null
    }
  }

  componentDidMount() {
    this.dataStore = DataStore.createInstance('UserManager')

    this.users = {}
    this.currentUser = null

    this.isInitialized = false

    this.dataStore.get(['users', 'currentUser'], results => {
      if (results[1]) {
        this.setCurrentUser(new User(results[1]))
      } else {
        this.setCurrentUser(new User())
      }
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

  setCurrentUser(user) {
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

    this.setState({
      currentUser: this.currentUser
    })
  }

  logout() {
    this.setCurrentUser(null)
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

  render() {
    return (
      <UserContext.Provider value={{ user: this.state.currentUser }}>
        {this.props.children}
      </UserContext.Provider>
    )
  }
}

export { UserProvider, UserContext }

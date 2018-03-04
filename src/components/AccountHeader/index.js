import React from 'react'

import Observable from '../../utilities/Observable'
import UserManager from '../../account/UserManager'

export default class AccountHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: UserManager.currentUser,
      isLoggingIn: false,
      expanded: false
    }
  }

  startLogin() {
    this.setState({
      isLoggingIn: true
    })

    UserManager.startLogin((status, user) => {
      if (status == 'success') {
        this.setState({
          user: user,
          isLoggingIn: false,
          expanded: false
        })
      } else {
        this.setState({
          isLoggingIn: false
        })
      }
    })
  }

  componentDidMount() {
    Observable.global.on(this, 'updateCurrentUser', this.onUpdateCurrentUser)
  }

  onUpdateCurrentUser(data) {
    this.setState({
      user: data.user,
      isLoggingIn: false
    })
  }

  logout() {
    UserManager.logout()
  }

  toggleExpanded() {
    this.setState({
      expanded: this.state.expanded
    })
  }

  render() {
    // handle buttons states
    let button = (
      <div
        className="button account-header"
        onClick={this.startLogin.bind(this)}>
        Login
      </div>
    )
    if (this.state.user) {
      button = (
        <div className="button account-header disabled">
          {this.state.user.username}
        </div>
      )
    } else if (this.state.isLoggingIn) {
      button = (
        <div className="button account-header disabled">
          Waiting to Login...
        </div>
      )
    }

    let logout = null
    if (this.state.user != null) {
      logout = (
        <div className="button logout" onClick={this.logout.bind(this)}>
          Logout
        </div>
      )
    }

    return (
      <div className="account-options">
        {button}
        {logout}
      </div>
    )
  }
}

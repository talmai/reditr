import React from 'react'

export default class AccountHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      isLoggingIn: false,
      expanded: false
    }
  }

  startLogin() {
    this.setState({
      isLoggingIn: true
    })

    this.props.userManager.startLogin().then(({ status, user }) => {
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

  onUpdateCurrentUser(data) {
    this.setState({
      user: data.user,
      isLoggingIn: false
    })
  }

  logout() {
    this.props.userManager.logout().then(user => {
      this.setState({
        user
      })
    })
  }

  toggleExpanded() {
    this.setState({
      expanded: this.state.expanded
    })
  }

  render() {
    // handle buttons states
    let button = (
      <div className="button account-header" onClick={this.startLogin.bind(this)}>
        Login
      </div>
    )
    if (this.state.user.isAuthed()) {
      button = <div className="button account-header disabled">{this.state.user.username}</div>
    } else if (this.state.isLoggingIn) {
      button = <div className="button account-header disabled">Waiting to Login...</div>
    }

    let logout = null
    if (this.state.user.isAuthed()) {
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

import React from 'react'
import UserManager from './UserManager'

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

import React from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router'

class LoginView extends React.Component {

    constructor(props) {
        super(props)
        
        this.state = {
            username: "",
            password: ""
        }
    }

    onClickLogin() {
        Parse.User.logIn(this.state.username, this.state.password, {
          success: function(user) {
            window.location.href = './index.html'
          },
          error: function(user, error) {
            // The login failed. Check error to see why.
            alert(error);
          }
        });
    }

    usernameChange(event) {
        this.setState({
            username: event.target.value
        })
    }

    passwordChange(event) {
        this.setState({
            password: event.target.value
        })
    }

    componentDidMount() {
        this.refs.usernameField.getDOMNode().focus()
    }

    render() {
        return (
          <div className="LoginView">
            <div className="logo"><img src="images/logo.png" /></div>
            <h3>Login</h3>
            <div className="form-container">
                <input type="text" placeholder="USERNAME" ref="usernameField" onChange={this.usernameChange.bind(this)} />
                <input type="password" placeholder="PASSWORD" onChange={this.passwordChange.bind(this)} />
                <input className="login-btn" onClick={this.onClickLogin.bind(this)} type="submit" value="Login" />
                <Link className="signup-link" to="/signup">Need to Register?</Link>
            </div>
          </div>
        )
    }
}

export default LoginView

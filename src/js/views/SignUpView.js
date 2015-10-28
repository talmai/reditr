import React from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router'

class SignUpView extends React.Component {

    constructor(props) {
      super(props);
      
      this.state = {
          username: "",
          password: "",
          email: ""
      }
    }

    onClickSignup() {
        let user = new Parse.User()
        user.set("username", this.state.username)
        user.set("password", this.state.password)
        user.set("email", this.state.email)

        user.signUp(null, {
            success: function(user) {
                // Hooray! Let them use the app now.
                window.location.href = './index.html'
            },

            error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        })
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

    emailChange(event) {
        this.setState({
            email: event.target.value
        })
    }

    render() {
        return (
          <div className="SignUpView">
            <h3>Signup</h3>
            <input type="text" placeholder="Username" onChange={this.usernameChange.bind(this)} />
            <input type="password" placeholder="Password" onChange={this.passwordChange.bind(this)} />
            <input type="email" placeholder="Email" onChange={this.emailChange.bind(this)} />
            <input onClick={this.onClickSignup.bind(this)} type="submit" value="Submit" />
            <Link to="/">Already have an account?</Link>
          </div>
        )
    }
}

export default SignUpView

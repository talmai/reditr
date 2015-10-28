import React from 'react'
import { render } from 'react-dom'
import createHistory from 'history/lib/createHashHistory'
import LoginView from './views/LoginView.js'
import SignUpView from './views/SignUpView.js'
import AdminView from './views/AdminView.js'
import HeaderView from './views/HeaderView.js'

// First we import some components...
import { Router, Route, IndexRoute, Link } from 'react-router'

// Opt-out of persistent state, not recommended.
var history = createHistory({
  queryKey: false
});

// Then we delete a bunch of code from App and
// add some <Link> elements...
class App extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            showHeader: Parse.User.current() // show header if logged in
        }
    }

    render() {
        return (
            <div>
                {
                    function(){
                        if (this.state.showHeader) {
                            return <HeaderView />
                        }
                    }.call(this)
                }
                {/*
                    next we replace `<Child>` with `this.props.children`
                    the router will figure out the children for us
                */}
                {this.props.children}
            </div>
        )
    }
}

// init parse
Parse.initialize("KEY1", "KEY2");

let firstScreen = Parse.User.current() ? AdminView : LoginView

// Finally, we render a <Router> with some <Route>s.
// It does all the fancy routing stuff for us.
render((
  <Router history={history}>
    <Route path="/" component={App}>
        <IndexRoute component={firstScreen} />
        <Route path="/signup" component={SignUpView} />
    </Route>
  </Router>
), document.getElementById('App'))

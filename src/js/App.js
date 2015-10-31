import React from 'react'
import { render } from 'react-dom'
import createHistory from 'history/lib/createBrowserHistory'

import HeaderView from './views/HeaderView.js'
import StreamView from './views/StreamView.js'

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
    }

    render() {
        return (
            <div>
                <HeaderView />
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

// Finally, we render a <Router> with some <Route>s.
// It does all the fancy routing stuff for us.
render((
  <Router history={history}>
    <Route path="/" component={App}>
        <IndexRoute component={StreamView} />
    </Route>
  </Router>
), document.getElementById('App'))

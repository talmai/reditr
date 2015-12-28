import React from 'react';
import { render } from 'react-dom';
import history from './History';
import HeaderView from './views/HeaderView';
import QuickSwitchView from './views/QuickSwitchView';
import StreamView from './views/StreamView';
import PostView from './views/PostView';
import Keystrokes from './Keystrokes';
import Observable from './utilities/Observable';
import { Router, Route, IndexRoute, Link } from 'react-router';

// Then we delete a bunch of code from App and
// add some <Link> elements...
class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { quickSwitchVisible: false };
    }

    // this method is invoked when the user hits enter within the quickSwitcher, and
    // we want to close the quick switcher from here
    closeQuickSwitcher() {
        this.setState({ quickSwitchVisible: false });
    }

    componentDidMount() {
        Keystrokes.listen(['⌘o','⌃o'], event => this.setState({ quickSwitchVisible: !this.state.quickSwitchVisible }));
        Keystrokes.listen("⎋", event => {
            if(this.state.quickSwitchVisible) this.setState({ quickSwitchVisible: false });
        });
    }

    render() {
        var quickSwitch = this.state.quickSwitchVisible ? <QuickSwitchView onSubredditChanged={this.closeQuickSwitcher.bind(this)}/> : false;
        return (
            <div className="app-view">
                <HeaderView/>
                {this.props.children}
                {quickSwitch}
            </div>
        );
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
        <Route path="/r/:subreddit" component={StreamView} />
        <Route path="/r/:subreddit/:sort" component={StreamView} />
        <Route path="/r/:subreddit/comments/:id/" component={PostView} />
        <Route path="/r/:subreddit/comments/:id/:title/" component={PostView} />
    </Route>
  </Router>
), document.getElementById('App'));

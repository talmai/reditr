import React from 'react';
import { render } from 'react-dom';
import history from './utilities/History';
import HeaderView from './views/HeaderView';
import QuickSwitchView from './views/QuickSwitchView';
import StreamView from './views/StreamView';
import PostView from './views/PostView';
import Keystrokes from './utilities/Keystrokes';
import Observable from './utilities/Observable';
import Device from './utilities/Device';
import UserManager from './account/UserManager';
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
        Keystrokes.listen(['⌘e','⌃e'], event => this.setState({ quickSwitchVisible: !this.state.quickSwitchVisible }));
        Keystrokes.listen("⎋", event => {
            if(this.state.quickSwitchVisible) this.setState({ quickSwitchVisible: false });
        });
    }

    classForAppView() {
        var curClass = 'app-view';
        if (Device.isIE()) {
            curClass += ' isie';
        } else if (Device.isIOS()) {
            curClass += ' isios';
        }
        return curClass;
    }

    render() {
        var quickSwitch = this.state.quickSwitchVisible ? <QuickSwitchView onSubredditChanged={this.closeQuickSwitcher.bind(this)}/> : false;
        var curClass = this.classForAppView();
        return (
            <div className={curClass}>
                <HeaderView/>
                {this.props.children}
                {quickSwitch}
            </div>
        );
    }
}

// init parse
Parse.initialize("KEY1", "KEY2");

Observable.global.on("UserManagerInitialized", (userManager) => {
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

            <Route path="/u/:user" component={StreamView} />
            <Route path="/user/:user" component={StreamView} />
        </Route>
      </Router>
    ), document.getElementById('App'));
});

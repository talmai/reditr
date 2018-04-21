import React from 'react'
import { render } from 'react-dom'
import Viewer from 'react-viewer'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'

import history from '../../utilities/History'
import HeaderView from '../HeaderView'
import QuickSwitchView from '../QuickSwitchView'
import StreamContainer from '../StreamContainer'
import PostView from '../PostView'
import LeftSidebarView from '../LeftSidebarView'
import Keystrokes from '../../utilities/Keystrokes'
import Observable from '../../utilities/Observable'
import Device from '../../utilities/Device'
import UserManager from '../../account/UserManager'
import MainContainer from '../MainContainer'

// Then we delete a bunch of code from App and
// add some <Link> elements...
export default class App extends React.Component {
  static childContextTypes = {
    setViewerState: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = { quickSwitchVisible: false, viewerVisible: false, url: null, viewMode: 'column' }
  }

  getChildContext() {
    return {
      setViewerState: this.setViewer
    }
  }

  setViewer = url => {
    this.setState({
      viewerVisible: true,
      url
    })
  }

  // this method is invoked when the user hits enter within the quickSwitcher, and
  // we want to close the quick switcher from here
  closeQuickSwitcher() {
    this.setState({ quickSwitchVisible: false })
  }

  showQuickSwitcher() {
    this.setState({ quickSwitchVisible: !this.state.quickSwitchVisible })
  }

  componentDidMount() {
    Observable.global.on(this, 'requestQuickSwitcher', this.showQuickSwitcher)
    Observable.global.on(this, 'requestExitQuickSwitcher', this.closeQuickSwitcher)
    Keystrokes.listen(['⌘e', '⌃e'], this.showQuickSwitcher.bind(this))
    Keystrokes.listen('⎋', event => {
      if (this.state.quickSwitchVisible) this.closeQuickSwitcher()
    })

    require('react-viewer/dist/index.css')
  }

  classForAppView() {
    var curClass = 'app-view'
    if (Device.isIE()) {
      curClass += ' isie'
    } else if (Device.isIOS()) {
      curClass += ' isios'
    }
    return curClass
  }

  render() {
    var quickSwitch = this.state.quickSwitchVisible ? <QuickSwitchView onSubredditChanged={this.closeQuickSwitcher.bind(this)} /> : false
    var curClass = this.classForAppView()
    return (
      <Router>
        <div className={curClass}>
          <HeaderView />
          <LeftSidebarView />
          <MainContainer>
            <Switch>
              <Route exact path="/" component={StreamContainer} />
              <Route exact path="/r/:subreddit" component={StreamContainer} />
              <Route exact path="/r/:subreddit/:sort" component={StreamContainer} />
              <Route exact path="/r/:subreddit/comments/:id/" component={PostView} />
              <Route exact path="/r/:subreddit/comments/:id/:title/" component={PostView} />
              <Route exact path="/u/:user" component={StreamContainer} />
              <Route exact path="/user/:user" component={StreamContainer} />
            </Switch>
          </MainContainer>
          {quickSwitch}
          <Viewer
            visible={this.state.viewerVisible}
            onClose={() => {
              this.setState({ viewerVisible: false })
            }}
            images={[{ src: this.state.url, alt: '' }]}
          />
        </div>
      </Router>
    )
  }
}
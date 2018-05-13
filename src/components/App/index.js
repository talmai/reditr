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
import MainContainer from '../MainContainer'
import HoverView from '../HoverView'
import { UserProvider, UserContext } from '../../account/UserProvider'

// Then we delete a bunch of code from App and
// add some <Link> elements...
export default class App extends React.Component {
  static childContextTypes = {
    setViewerState: PropTypes.func,
    setHoverState: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      quickSwitchVisible: false,
      leftSidebarVisible: true,
      viewerVisible: false,
      url: null,
      viewMode: 'column',
      hoverPost: null,
      hoverAnchor: null
    }
    this.menuPressed = this.menuPressed.bind(this)
  }

  getChildContext() {
    return {
      setViewerState: this.setViewer,
      setHoverState: this.setHoverState
    }
  }

  resetState = () => {
    this.setState({
      quickSwitchVisible: false,
      leftSidebarVisible: true,
      viewerVisible: false,
      url: null,
      hoverPost: null,
      hoverAnchor: null,
      viewMode: 'column'
    })
  }

  setViewer = url => {
    this.setState({
      viewerVisible: true,
      url
    })
  }

  setHoverState = (post, anchor) => {
    this.setState({
      hoverPost: post,
      hoverAnchor: anchor
    })
  }

  // this method is invoked when the user hits enter within the quickSwitcher, and
  // we want to close the quick switcher from here
  closeQuickSwitcher() {
    this.setState({ quickSwitchVisible: false })
  }

  showQuickSwitcher = () => {
    this.setState({ quickSwitchVisible: !this.state.quickSwitchVisible })
  }

  handleLocationChange = location => {
    this.resetState()
  }

  componentDidMount() {
    this.handleLocationChange(this.router.history.location)
    this.router.history.listen(this.handleLocationChange)

    Observable.global.on(this, 'requestQuickSwitcher', this.showQuickSwitcher)
    Observable.global.on(this, 'requestExitQuickSwitcher', this.closeQuickSwitcher)
    Keystrokes.listen(['⌘e', '⌃e'], this.showQuickSwitcher)
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

  menuPressed() {
    this.setState({ leftSidebarVisible: !this.state.leftSidebarVisible })
  }

  render() {
    const quickSwitch = this.state.quickSwitchVisible && <QuickSwitchView onSubredditChanged={this.closeQuickSwitcher.bind(this)} />
    const curClass = this.classForAppView()
    return (
      <Router ref={r => (this.router = r)}>
        <UserProvider>
          <UserContext.Consumer>
            {val => {
              return (
                val.user && (
                  <div className={curClass}>
                    <HeaderView userManager={val.userManager} user={val.user} menuPressed={this.menuPressed} />
                    <LeftSidebarView hidden={!this.state.leftSidebarVisible} />
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
                    {this.state.hoverPost && <HoverView anchor={this.state.hoverAnchor} post={this.state.hoverPost} />}
                    <Viewer
                      visible={this.state.viewerVisible}
                      onClose={() => {
                        this.setState({ viewerVisible: false })
                      }}
                      images={[{ src: this.state.url, alt: '' }]}
                    />
                  </div>
                )
              )
            }}
          </UserContext.Consumer>
        </UserProvider>
      </Router>
    )
  }
}

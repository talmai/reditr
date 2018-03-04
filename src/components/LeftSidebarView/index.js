import React from 'react'
import Observable from '../../utilities/Observable'
import reddit from '../../api/reddit'
import SubredditListView from '../SubredditListView'

class LeftSidebarView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subreddits: []
    }
  }

  componentDidMount() {
    Observable.global.on(this, 'UserManagerInitialized', this.userDidChange)
    this.userDidChange()
  }

  componentWillUnmount() {
    Observable.global.removeAll(this)
  }

  userDidChange() {
    reddit.getSubscribedSubreddits().then(list => {
      const subreddits = list.map(subreddit => ({
        title: subreddit.title,
        url: subreddit.url,
        icon_img: subreddit.icon_img
      }))
      this.setState({ subreddits })
    })
  }

  render() {
    return (
      <div style={{height: 'calc(100% - 46px)'}} className="left-sidebar">
        <SubredditListView subreddits={this.state.subreddits} />
      </div>
    )
  }
}

export default LeftSidebarView

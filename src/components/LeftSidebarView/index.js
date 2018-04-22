import React from 'react'
import Observable from '../../utilities/Observable'
import reddit from '../../api/reddit'
import SubredditListView from '../SubredditListView'
import style from '../../utilities/Style'

const LeftSidebarView = style(class extends React.Component {

  static style() {
    return {
      root: {
        position: 'absolute',
        top: '46px',
        bottom: 0,
        left: 0,
        backgroundColor: '#F6F7F8',
        width: '230px',
        borderRight: '1px solid #d0d2d3',
        fontSize: '13px',
        color: '#373C3F',
        height: 'calc(100% - 46px)'
      }
    }
  }

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

  componentWillReceiveProps(newProps) {
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
    if (this.props.hidden) return null
    return (
      <div className={this.props.classes.root}>
        <SubredditListView subreddits={this.state.subreddits} />
      </div>
    )
  }

})

export default LeftSidebarView

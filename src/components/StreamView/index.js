import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import reddit from '../../api/reddit'
import StreamItemView from '../StreamItemView'
import StreamSpinnerView from '../StreamSpinnerView'
import PostModel from '../../models/PostModel'
import Observable from '../../utilities/Observable'

class StreamView extends React.Component {

  static contextTypes = {
    setHoverState: PropTypes.func
  }

  static propTypes = {
    subreddit: PropTypes.string,
    sort: PropTypes.string,
    period: PropTypes.string,
    style: PropTypes.object,
    isColumn: PropTypes.bool,
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  constructor(props) {
    super(props)

    this.state = {
      sort: this.props.sort || 'hot',
      period: this.props.period || 'all',
      postViews: [],
      postIds: {},
      after: null,
      isLoading: false,
      isColumn: this.props.isColumn,
      subreddit: this.props.subreddit
    }
  }

  componentWillUnmount() {
    this.detachScrollListener()
  }

  componentWillReceiveProps(props) {
    this.setState({
      subreddit: props.match.params.subreddit
    })
  }

  componentDidMount() {
    this.attachScrollListener()

    // load the posts
    this.load(this.state.subreddit)
  }

  /* Creates StreamItemView views from array of post objects from reddit (redditPosts) and
   * appends them to the (optional) array appendToArray. (optional) array of post
   * ids postIdsHash prevents duplicate views from being inserted
   */

  createViewsFromRedditPosts = (redditPosts, _appendToArray = [], postIdsHash = {}) => {
    const appendToArray = _appendToArray.slice()

    const hoverEvents = this.props.isColumn && {
      onHoverEnter: this.onStreamHoverEnter,
      onHoverLeave: this.onStreamHoverLeave
    }

    for (var i in redditPosts) {
      let post = redditPosts[i]
      // avoid duplicate posts in the same feed
      if (postIdsHash[post.data.id]) continue

      // insert post model/view into postViews - array of posts to render later
      let postObj = new PostModel(redditPosts[i])
      appendToArray.push(<StreamItemView {...hoverEvents} inColumn={this.props.isColumn} key={post.data.id} post={postObj} postIds={postIdsHash} />)
    }
    return appendToArray
  }

  onStreamHoverEnter = (post, node) => {
    this.hoverTimeout = setTimeout(() => this.context.setHoverState(post, node), 500)
  }

  onStreamHoverLeave = () => {
    clearTimeout(this.hoverTimeout)
    this.context.setHoverState(null)
  }

  loadUser(user = this.state.user, options = { reset: false }) {
    if (this.state.isLoading && !options.reset) return

    var state = {}
    if (options.reset) {
      state = {
        user: user,
        postViews: [],
        postIds: {},
        sort: this.defaults.sort,
        period: this.defaults.period,
        after: null,
        isLoading: true,
        notFound: false
      }
    } else {
      state = {
        isLoading: true,
        notFound: false
      }
    }

    this.setState(state, () => {
      // retreive the posts
      var options = {
        sort: this.state.sort,
        after: this.state.after,
        t: this.state.period
      }
      reddit.getPostsFromUser(user, options, (err, posts) => {
        // subreddit not found
        if (!posts || !posts.body) {
          this.setState({ user: user, notFound: true, isLoading: false })
          return
        }
        // update state to re render
        let newPosts = posts.body.data.children
        this.setState({
          postViews: this.createViewsFromRedditPosts(newPosts, this.state.postViews, this.state.postIds),
          user: user,
          after: posts.body.data.after,
          isLoading: false
        })
      })
    })
  }

  load(subreddit = this.state.subreddit, options = { reset: false }) {
    if (this.state.isLoading && !options.reset) return

    var state = {}
    if (options.reset) {
      state = {
        subreddit,
        postViews: [],
        postIds: {},
        sort: this.state.sort,
        period: this.state.period,
        after: null,
        isLoading: true,
        notFound: false
      }
    } else {
      state = {
        isLoading: true,
        notFound: false
      }
    }

    this.setState(state, () => {
      // retreive the posts
      const options = {
        sort: this.state.sort,
        after: this.state.after,
        t: this.state.period
      }
      reddit.getPostsFromSubreddit(subreddit, options, (err, posts) => {
        if (err) {
          return
        }

        if (!posts || !posts.body) {
          // subreddit not found
          this.setState({ subreddit, notFound: true, isLoading: false })
          return
        }
        // build new models and views here (prefer views built in render, speed sacrifice)
        const newPosts = posts.body.data.children
        const postViews = this.createViewsFromRedditPosts(newPosts, this.state.postViews, this.state.postIds)
        this.setState({
          subreddit,
          after: posts.body.data.after,
          isLoading: false,
          postViews
        })
      })
    })
  }

  componentWillReceiveProps(props) {
    if (this.state.subreddit !== props.subreddit) {
      this.load(props.subreddit, { reset: true }) // loads new prop info
    }
  }

  onUpdateCurrentUser(data) {
    if (this.props.user) {
      this.loadUser(this.state.user, { reset: true })
    } else {
      // load the posts
      this.load(this.state.subreddit, { reset: true })
    }
  }

  /* scroll management */

  didStopScrolling = () => {
    const node = ReactDOM.findDOMNode(this.streamContainer)
    if (node.scrollHeight - (node.scrollTop + node.offsetHeight) < 100) {
      // detect scrolling to the bottom and load more posts
      this.load()
    }
    // find elements off screen
    const postNodes = node.querySelectorAll('.stream-item-view')
    const screensToPreload = 4
    const startY = node.scrollTop - 4 * node.offsetHeight
    const endY = node.scrollTop + (screensToPreload + 1) * node.offsetHeight
    const postIds = this.state.postIds
    for (var i = 0; i < postNodes.length; i++) {
      const post = postNodes[i]
      if (post.offsetTop + post.clientHeight < startY || post.offsetTop > endY) {
        if (!post.classList.contains('hidden')) {
          post.classList.add('hidden')
          let postid = post.getAttribute('data-postid')
          postIds[postid].didDisappear(post)
        }
      } else {
        if (post.classList.contains('hidden')) {
          post.classList.remove('hidden')
          let postid = post.getAttribute('data-postid')
          postIds[postid].didAppear(post)
        }
      }
    }
  }

  scrollListener = () => {
    clearTimeout(this.stopScrollingTimeout)
    this.stopScrollingTimeout = setTimeout(this.didStopScrolling, 200)
  }

  attachScrollListener = () => {
    let node = ReactDOM.findDOMNode(this.streamContainer)
    node.addEventListener('scroll', this.scrollListener)
    node.addEventListener('resize', this.scrollListener)
  }

  detachScrollListener = () => {
    let node = ReactDOM.findDOMNode(this.streamContainer)
    node.removeEventListener('scroll', this.scrollListener)
    node.removeEventListener('resize', this.scrollListener)
  }

  renderHeader = () => {
    if (!this.props.isColumn) {
      return
    }

    const styles = {
      container: {
        textAlign: 'left',
        padding: '10px',
        borderBottom: '1px solid #eee',
        height: '64px',
        boxSizing: 'border-box',
        backgroundColor: '#fefefe'
      },
      title: {
        fontSize: '20px',
        fontWeight: 600,
        margin: 0
      },
      sort: {
        fontSize: '12px'
      }
    }

    return (
      <header style={styles.container}>
        <h3 style={styles.title}>r/{this.state.subreddit}</h3>
        <span style={styles.sort}>{this.state.sort}</span>
      </header>
    )
  }

  render() {
    const loading = this.state.isLoading ? <StreamSpinnerView /> : false
    const notFound = this.state.notFound ? <div>Subreddit {this.state.subreddit} does not exist.</div> : false

    let styles = {
      container: {
        ...this.props.style
      }
    }

    if (this.props.isColumn) {
      styles.container = {
        ...styles.container,
        backgroundColor: '#fff',
        border: '1px solid #eee',
        overflow: 'hidden'
      }

      styles.stream = {
        height: 'calc(100% - 64px)',
        overflowY: 'scroll'
      }
    }

    return (
      <div style={styles.container} className={`stream-view ${this.props.className}`}>
        {this.renderHeader()}
        <div ref={s => (this.streamContainer = s)} style={styles.stream}>
          {this.state.postViews}
        </div>
        {loading}
        {notFound}
      </div>
    )
  }
}

export default StreamView

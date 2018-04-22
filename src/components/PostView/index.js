import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import style from '../../utilities/Style'
import PostModel from '../../models/PostModel'
import MediaParserView from '../MediaParserView'
import reddit from '../../api/reddit'
import PostCommentView from '../PostCommentView'
import CommentModel from '../../models/CommentModel'
import Observable from '../../utilities/Observable'
import StreamSpinnerView from '../StreamSpinnerView'
import VoteView from '../VoteView'
import StreamView from '../StreamView'

class PostView extends React.Component {
  static contextTypes = {
    setViewerState: PropTypes.func
  }

  static style() {
    return {
      container: {
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      },
      stream: {
        width: '280px',
        flexShrink: 0,
        height: '100%'
      },
      voteContainer: {
        width: '40px'
      },
      postView: {
        flexGrow: 1
      }
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      subreddit: props.match.params.subreddit,
      post: null,
      comments: [],
      isLoading: true
    }
  }

  componentDidMount() {
    this.load()
  }

  componentWillReceiveProps(newProps) {
    if (this.props.match.params.id !== newProps.match.params.id) {
      this.setState(
        {
          subreddit: newProps.match.params.subreddit,
          isLoading: true
        },
        this.load
      )
    }
  }

  load = () => {
    reddit.getPostFromPermalink(window.location.pathname, null, (err, data) => {
      var post = new PostModel(data.body[0].data.children[0])
      this.setState({
        post,
        comments: data.body[1].data.children,
        isLoading: false
      })
      if (this.props.route) {
        Observable.global.trigger('offerBreadcrumb', {
          text: post.get('title'),
          href: post.get('url')
        })
      }
    })
  }

  render() {
    if (this.state.isLoading)
      return (
        <div className={this.props.classes.container}>
          <StreamView className={this.props.classes.stream} isColumn={true} subreddit={this.state.subreddit} />
          <StreamSpinnerView />
        </div>
      )

    let post = this.state.post
    let comments = this.state.comments

    let commentViews = []
    comments.forEach(comment => {
      if (comment.kind != 'more') {
        let commentObj = new CommentModel(comment)
        commentViews.push(<PostCommentView key={commentObj.get('id')} comment={commentObj} />)
      }
    })

    const styles = {
      post: {
        position: 'relative',
        backgroundColor: 'white',
        border: '1px solid #eee',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'scroll'
      }
    }

    return (
      <div className={this.props.classes.container}>
        <StreamView className={this.props.classes.stream} isColumn={true} subreddit={this.state.subreddit} />
        <div style={styles.post} className={`post-view ${this.props.classes.postView}`}>
          <div className="post-content">
            <div className={`post-vote ${this.props.classes.voteContainer}`}>
              <VoteView key="vote" item={post} />
            </div>
            <a href={post.get('url')} target="_blank" className="post-title">
              {post.get('title')}
            </a>
            <Link className="post-author" to={`/u/${post.get('author')}`}>
              {post.get('author')}
            </Link>
            <MediaParserView onClick={url => this.context.setViewerState(url)} url={post.get('url')} post={post} />
          </div>
          <div className="post-separator" />
          <div className="post-comments">{commentViews}</div>
        </div>
      </div>
    )
  }
}

export default style(PostView)

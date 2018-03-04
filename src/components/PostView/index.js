import React from 'react'
import PropTypes from 'prop-types'

import PostModel from '../../models/PostModel'
import MediaParserView from '../MediaParserView'
import reddit from '../../api/reddit'
import PostCommentView from '../PostCommentView'
import CommentModel from '../../models/CommentModel'
import Observable from '../../utilities/Observable'
import StreamSpinnerView from '../StreamSpinnerView'
import VoteView from '../VoteView'

class PostView extends React.Component {

  static contextTypes = {
    setViewerState: PropTypes.func
  }

  constructor(props) {
    super(props)

    this.state = {
      post: null,
      comments: [],
      isLoading: true
    }
  }

  componentDidMount() {
    this.load()
  }

  load() {
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
        <div className="post-view">
          <StreamSpinnerView />
        </div>
      )

    let post = this.state.post
    let comments = this.state.comments

    let commentViews = []
    comments.forEach(comment => {
      if (comment.kind != 'more') {
        let commentObj = new CommentModel(comment)
        commentViews.push(
          <PostCommentView key={commentObj.get('id')} comment={commentObj} />
        )
      }
    })

    return (
      <div className="post-view">
        <div className="post-content">
          <div className="post-vote">
            <VoteView key="vote" item={post} />
          </div>
          <a href={post.get('url')} target="_blank" className="post-title">
            {post.get('title')}
          </a>
          <span className="post-author">{post.get('author')}</span>
          <MediaParserView onClick={url => this.context.setViewerState(url)} url={post.get('url')} post={post} />
        </div>
        <div className="post-separator" />
        <div className="post-comments">{commentViews}</div>
      </div>
    )
  }
}

export default PostView

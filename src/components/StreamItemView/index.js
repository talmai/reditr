import React from 'react'
import moment from 'moment'
import { AllHtmlEntities as Entities } from 'html-entities'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import style from '../../utilities/Style'
import reddit from '../../api/reddit'
import CommentModel from '../../models/CommentModel'
import StreamCommentView from '../StreamCommentView'
import VoteView from '../VoteView'
import { prettyNumber } from '../../utilities/Common'
import MediaParserView from '../MediaParserView'

class StreamItemView extends React.Component {
  static contextTypes = {
    setViewerState: PropTypes.func,
    router: PropTypes.object
  }

  static propTypes = {
    post: PropTypes.object,
    inColumn: PropTypes.bool
  }

  static style() {
    const streamTitle = {
      fontWeight: 'bold',
      color: '#333',
      textDecoration: 'none',
      fontSize: '14px'
    }
    const streamTitleLink = {
      ...streamTitle,
      '&:hover': {
        color: 'black',
        textDecoration: 'underline'
      }
    }

    return {
      streamTitle,
      streamTitleLink
    }
  }

  constructor(props) {
    super(props)
    // get the vote direction
    let voteDir = 0

    switch (this.props.post.get('likes')) {
      case null:
        voteDir = 0
        break
      case true:
        voteDir = 1
        break
      case false:
        voteDir = -1
        break
    }

    // set default
    this.state = {
      topComments: [],
      isLoading: true,
      showNSFW: false
    }

    if (this.props.postIds) {
      this.props.postIds[this.props.post.get('id')] = this
    }
  }

  componentDidMount() {
    this.loadComments()
  }

  loadComments() {
    let permalink = this.props.post.get('permalink')

    if (permalink) {
      // if permalink exists, proceed
      reddit.getPostFromPermalink(this.props.post.get('permalink'), null, (err, data) => {
        let comments = data.body[1].data.children
        let maxComments = Math.min(comments.length, 5)
        var first, second
        for (var i = 0; i < maxComments; i++) {
          var checking = comments[i]
          if (checking.data.body == '[removed]') continue
          if (!first) {
            first = checking
          } else if (!second) {
            second = checking
          } else {
            var newFirst = first.data.body.length < second.data.body.length ? first : second
            var rejected = newFirst == first ? second : first
            first = newFirst
            second = rejected.data.body.length < checking.data.body.length ? rejected : checking
          }
        }
        var topComments = []
        if (first) topComments.push(first)
        if (second) topComments.push(second)
        this.setState({
          isLoading: false,
          topComments: topComments,
          comments: comments
        })
      })
    } else {
      this.setState({ isLoading: false, topComments: [] })
    }
  }

  enableNSFW() {
    this.setState({
      showNSFW: true
    })
  }

  didDisappear(post) {
    this.setState({ hidden: true, height: post.clientHeight })
  }

  didAppear() {
    this.setState({ hidden: false })
  }

  openInPostView = () => {
    if (this.props.inColumn) {
      this.context.router.history.push(this.props.post.get('permalink'))
    }
  }

  renderMedia = () => {
    const post = this.props.post

    let postMedia = false
    if (!this.props.inColumn) {
      if (post.get('over_18') && !this.state.showNSFW) {
        postMedia = (
          <div onClick={this.enableNSFW.bind(this)} className="nsfw-btn">
            Show NSFW Content
          </div>
        )
      } else if (this.state.hidden) {
        postMedia = false
      } else {
        postMedia = <MediaParserView onClick={url => this.context.setViewerState(url)} url={post.get('url')} post={post} />
      }
    }

    return postMedia
  }

  renderTopComments = () => {
    const post = this.props.post
    const topComments = this.state.topComments
    let commentsView = []

    // if no comments, say no comments
    if (topComments.length == 0) {
      commentsView = <span className="no-comments">No comments!</span>
    } else {
      var commentCount = post.get('num_comments')
      topComments.forEach(comment => {
        commentCount--
        let commentObj = new CommentModel(comment)
        commentsView.push(<StreamCommentView key={commentObj.get('id')} comment={commentObj} />)
      })
      if (this.state.comments.length > 2) {
        commentCount = commentCount <= 0 ? '' : prettyNumber(commentCount)
        commentsView.push(
          <Link key="more" text={Entities.decode(post.get('title'))} to={post.get('permalink')} className="view-more-comments">
            <div className="icon">{commentCount} More Comments</div>
          </Link>
        )
      }
    }

    return commentsView
  }

  renderDetails = () => {
    const post = this.props.post

    if (this.props.inColumn) {
      const styles = {
        container: {
          clear: 'both',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: '5px'
        }
      }
      return (
        <div style={styles.container} className="mini-details">
          <Link to={'/user/' + post.get('author')} className="stream-item-author">
            {post.get('author')}
          </Link>
          <span>
            {moment
              .unix(post.get('created_utc'))
              .fromNow()
              .replace(' ago', '')}
          </span>
        </div>
      )
    } else {
      return (
        <div className="mini-details">
          <Link to={'/user/' + post.get('author')} className="stream-item-author">
            {post.get('author')}
          </Link>
          <span> posted in </span>
          <Link to={'/r/' + post.get('subreddit')} className="stream-item-subreddit">
            {'/r/' + post.get('subreddit')}
          </Link>
          <span> {moment.unix(post.get('created_utc')).fromNow()}</span>
        </div>
      )
    }
  }

  renderThumbnail = () => {
    const post = this.props.post
    if (this.props.inColumn && post.get('thumbnail') && post.get('domain').indexOf('self.') === -1) {
      const styles = {
        thumbnail: {
          float: 'left',
          width: '50px',
          height: '50px',
          borderRadius: '4px',
          border: '1px solid #fefefe',
          backgroundImage: `url(${post.get('thumbnail')})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 50%',
          marginRight: '5px',
          marginBottom: '5px'
        }
      }
      return <div style={styles.thumbnail} />
    }
  }

  renderTitle = () => {
    const post = this.props.post

    if (this.props.inColumn) {
      return <span className={this.props.classes.streamTitle}>{Entities.decode(post.get('title'))}</span>
    } else {
      return (
        <a className={this.props.classes.streamTitleLink} href={post.get('url')} target="_blank">
          {Entities.decode(post.get('title'))}
        </a>
      )
    }
  }

  render() {
    const post = this.props.post

    // WARN: if it is a comment, ignore for now
    if (post.kind == 't1') {
      return false
    }

    let styles = {
      container: {
        minHeight: this.state.height || 'auto'
      },
      voteContainer: {
        borderLeft: '1px solid #efefef'
      }
    }

    if (this.props.inColumn) {
      styles.container = {
        ...styles.container,
        cursor: 'pointer',
        margin: 0,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid #efefef'
      }

      styles.voteContainer = {
        ...styles.voteContainer,
        width: '50px',
        fontSize: '12px'
      }

      styles.content = {
        width: 'calc(100% - 50px)',
        boxSizing: 'border-box'
      }
    }

    if (this.state.hidden) {
      return (
        <div style={styles.container} onClick={this.openInPostView} className="stream-item-view hidden" data-postid={post.get('id')}>
          <div className="stream-item-top">
            <div style={styles.voteContainer} className="stream-item-sidebar">
              <VoteView item={this.props.post} />
            </div>
            <div className="stream-item-content">
              <a href={post.get('url')} target="_blank" className={this.props.classes.streamTitle}>
                {Entities.decode(post.get('title'))}
              </a>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.container} onClick={this.openInPostView} className="stream-item-view" data-postid={post.get('id')}>
        <div className="stream-item-top">
          <div style={styles.voteContainer} className="stream-item-sidebar">
            <VoteView item={this.props.post} />
          </div>
          <div style={styles.content} className="stream-item-content">
            {this.renderThumbnail()}
            {this.renderTitle()}
            <span className="stream-item-domain">({post.get('domain')})</span>
            {this.renderMedia()}
            {this.renderDetails()}
          </div>
        </div>
        {this.props.inColumn ? null : (
          <div className="stream-item-comments">{this.state.isLoading ? <div className="loading">Loading...</div> : this.renderTopComments()}</div>
        )}
      </div>
    )
  }
}

export default style(StreamItemView)

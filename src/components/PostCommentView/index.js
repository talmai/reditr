import React from 'react'
import { Link } from 'react-router-dom'

import style from '../../utilities/Style'
import { decodeEntities } from '../../utilities/Common'
import CommentModel from '../../models/CommentModel'
import VoteView from '../VoteView'

class PostCommentView extends React.Component {
  static style() {
    return {
      postAuthor: {
        position: 'absolute',
        top: '10px',
        left: '60px',
        color: '#aeaeae'
      }
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      comment: this.props.comment
    }
  }

  render() {
    let comment = this.props.comment
    let body_html = decodeEntities(comment.get('body_html'))

    // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
    let parsedHtml = body_html.split('<a ').join('<a target="_blank" ')

    try {
      let replyData = comment.get('replies')
      let replies = []
      if (replyData) {
        replies = replyData.data.children
      }
      let replyViews = []
      replies.forEach(comment => {
        if (comment.kind != 'more') {
          let commentObj = new CommentModel(comment)
          replyViews.push(<PostCommentView key={commentObj.get('id')} comment={commentObj} />)
        }
      })

      const styles = {
        container: {
          marginTop: '10px'
        },
        voteBackground: {
          backgroundColor: 'rgba(0,0,0,0.01)',
          borderRight: '1px solid #eee',
          position: 'absolute',
          height: '100%',
          width: '40px',
          top: 0,
          left: 0,
          zIndex: 0
        },
        commentContainer: {
          display: 'flex'
        },
        voteContainer: {
          top: 0,
          left: 0,
          zIndex: 1,
          width: '40px'
        },
        commentBody: {
          padding: '30px 20px',
          fontSize: '14px',
          boxSizing: 'border-box'
        },
        postAuthor: {
          position: 'absolute',
          top: '10px',
          left: '60px',
          color: '#aeaeae'
        }
      }
      
      return (
        <div style={styles.container} key={this.props.key} className="post-comment">
          <div style={styles.voteBackground} />
          <div style={styles.commentContainer}>
            <div style={styles.voteContainer} className="post-comment-vote">
              <VoteView key="vote" item={comment} />
            </div>
            {/*
            WARNING: Last resort using dangerouslySetInnerHTML, decoding html entities with every solution that could be found online did not help
            */}
            <div style={styles.commentBody} className="post-comment-body" dangerouslySetInnerHTML={{ __html: parsedHtml }} />
          </div>
          <Link style={styles.postAuthor} to={`/u/${comment.get('author')}`}>
            {comment.get('author')}
          </Link>
          <div className="post-comment-children">{replyViews}</div>
        </div>
      )
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

export default style(PostCommentView)

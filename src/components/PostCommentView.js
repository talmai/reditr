import React from 'react';
import { decodeEntities } from '../utilities/Common';
import CommentModel from '../models/CommentModel';
import VoteView from './VoteView';

class PostCommentView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      comment: this.props.comment
    };
  }

  render() {

    let comment = this.props.comment;
    let body_html = decodeEntities(comment.get("body_html"));

    // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
    let parsedHtml = body_html.split("<a ").join("<a target=\"_blank\" ");

    try {
      let replyData = comment.get('replies');
      let replies = [];
      if (replyData) {
        replies = replyData.data.children;
      }
      let replyViews = [];
      replies.forEach(comment => {
        if (comment.kind != "more") {
          let commentObj = new CommentModel(comment);
          replyViews.push(<PostCommentView key={commentObj.get("id")} comment={commentObj} />);
        }
      });

      return (
        <div key={this.props.key} className="post-comment">
          <div className="post-comment-vote">
            <VoteView key="vote" item={comment} />
          </div>
          {
            /*
            WARNING: Last resort using dangerouslySetInnerHTML, decoding html entities with every solution that could be found online did not help
            */
          }
          <div className="post-comment-body" dangerouslySetInnerHTML={{__html: parsedHtml}}></div>
          <span className="post-comment-author">{comment.get("author")}</span>
          <div className="post-comment-children">
            {replyViews}
          </div>
        </div>
      );
    } catch (e) {
      return false;
    }
  }
}

export default PostCommentView;

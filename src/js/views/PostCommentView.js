import React from 'react';
import { decodeEntities } from '../Utilities.js';
import CommentModel from '../models/CommentModel.js';

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
            let replies = comment.get('replies').data.children;
            let replyViews = [];
            replies.forEach(comment => {
                if (comment.kind != "more") {
                    let commentObj = new CommentModel(comment);
                    replyViews.push(<PostCommentView key={commentObj.get("id")} comment={commentObj} />);
                }
            });

            return (
                <div key={this.props.key} className="post-comment">
                    <span className="post-comment-score">{comment.get("score")}</span>
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

import React from 'react';

import CommentModel from '../models/CommentModel.js';

class PostCommentView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            comment: this.props.comment
        }
    }

    render() {

        // WARNING, MOVE THIS TO A UTILITIES FILE
        var decodeEntities = (function() {
          // this prevents any overhead from creating the object each time
          var element = document.createElement('div');

          function decodeHTMLEntities (str) {
            if(str && typeof str === 'string') {
              // strip script/html tags
              str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
              str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
              element.innerHTML = str;
              str = element.textContent;
              element.textContent = '';
            }

            return str;
          }

          return decodeHTMLEntities;
        })();

        let comment = this.props.comment;
        let body_html = decodeEntities(comment.get("body_html"));
        console.log(body_html, comment);
        // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
        let parsedHtml = body_html.split("<a ").join("<a target=\"_blank\" ");

        try {
            let replies = comment.get('replies').data.children;
            let replyViews = [];
            replies.forEach(comment => {
                console.log(comment.kind)
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
            )
        } catch (e) {
            return false
        }
    }
}

export default PostCommentView

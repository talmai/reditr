import React from 'react'

import HtmlToReact from 'html-to-react'

class StreamCommentView extends React.Component {

    constructor(props) {
        super(props);

        // no media as default
        this.state = {
            comment: {}
        }
    }

    render() {
        let comment = this.props.comment;
        let body_html = decodeEntities(comment.get("body_html"));

        return (
            <div key={this.props.key} className="stream-item-comment">
                <span className="stream-item-comment-score">{comment.get("score")}</span>
                {
                    /*
                    WARNING: Last resort using dangerouslySetInnerHTML, decoding html entities with every solution that could be found online did not help
                    */
                }
                <div className="stream-item-comment-body" dangerouslySetInnerHTML={{__html: body_html}}></div>
                <span className="stream-item-comment-author">{comment.get("author")}</span>
            </div>
        )
    }

}

export default StreamCommentView

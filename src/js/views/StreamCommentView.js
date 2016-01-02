import React from 'react';
import HtmlToReact from 'html-to-react';
import { decodeEntities } from '../utilities/Common';

class StreamCommentView extends React.Component {

    constructor(props) {
        super(props);

        // no media as default
        this.state = {
            comment: this.props.comment
        };
    }

    render() {

        let comment = this.state.comment;
        let body_html = decodeEntities(comment.get("body_html"));
        if(!body_html) console.log(comment);
        // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
        let parsedHtml = body_html.split("<a ").join("<a target=\"_blank\" ");

        return (
            <div key={this.props.key} className="stream-item-comment">
                <div className="author">{comment.get("author")}</div>
                <div className="comment-body" dangerouslySetInnerHTML={{__html: parsedHtml}}></div>
                <span className="comment-score">{comment.get("score")}</span>
            </div>
        );
    }

}

export default StreamCommentView;

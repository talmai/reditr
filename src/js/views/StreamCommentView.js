import React from 'react';
import HtmlToReact from 'html-to-react';
import { decodeEntities } from '../Utilities';

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
        let parsedHtml = body_html.split("<a ").join("<a target=\"_blank\" ").replace('<div class="md"><p>','<div class="md"><p><div class="stream-item-comment-author">'
                                                                                      + comment.get("author")
                                                                                      + ':</div>');

        return (
            <div key={this.props.key} className="stream-item-comment">
                <div className="stream-item-comment-body" dangerouslySetInnerHTML={{__html: parsedHtml}}></div>
                <span className="stream-item-comment-score">{comment.get("score")}</span>
            </div>
        );
    }

}

export default StreamCommentView;

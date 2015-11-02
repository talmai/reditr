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
        // WARNING, MOVE THIS TO A UTILITIES FILE
        window.decode_html_entities_node = document.createElement('DIV');
        function decode_html_entities(content) {
        	window.decode_html_entities_node.innerHTML = content;
        	return window.decode_html_entities_node.textContent;
        }

        let comment = this.props.comment;
        let body_html = decode_html_entities(comment.get("body_html"));
        
        // convert reddits html entities into something react can use
        var htmlToReactParser = new HtmlToReact.Parser(React);
        var reactComponent = htmlToReactParser.parse(body_html);

        return (
            <div key={this.props.key} className="stream-item-comment">
                <span className="stream-item-comment-score">{comment.get("score")}</span>
                <div className="stream-item-comment-body">{reactComponent}</div>
                <span className="stream-item-comment-author">{comment.get("author")}</span>
            </div>
        )
    }

}

export default StreamCommentView

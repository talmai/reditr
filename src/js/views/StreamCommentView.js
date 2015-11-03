import React from 'react'

import HtmlToReact from 'html-to-react'

class StreamCommentView extends React.Component {

    constructor(props) {
        super(props);

        // no media as default
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

        let comment = this.state.comment;
        let body_html = decodeEntities(comment.get("body_html"));

        // forces all links to open in new tab (faster than regex in newer versions of V8) http://jsperf.com/replace-all-vs-split-join
        let parsedHtml = body_html.split("<a ").join("<a target=\"_blank\" ");

        return (
            <div key={this.props.key} className="stream-item-comment">
                <span className="stream-item-comment-score">{comment.get("score")}</span>
                {
                    /*
                    WARNING: Last resort using dangerouslySetInnerHTML, decoding html entities with every solution that could be found online did not help
                    */
                }
                <div className="stream-item-comment-body" dangerouslySetInnerHTML={{__html: parsedHtml}}></div>
                <span className="stream-item-comment-author">{comment.get("author")}</span>
            </div>
        )
    }

}

export default StreamCommentView

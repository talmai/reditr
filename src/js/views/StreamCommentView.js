import React from 'react';
import HtmlToReact from 'html-to-react';
import { decodeEntities } from '../utilities/Common';

// material
import ListItem from 'material-ui/lib/lists/list-item';

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
            <ListItem
                key={this.props.key}
                primaryText={comment.get("author")}
                secondaryText={
                  <div dangerouslySetInnerHTML={{__html: parsedHtml}} />
                }
                secondaryTextLines={2} />
        );
    }

}

export default StreamCommentView;

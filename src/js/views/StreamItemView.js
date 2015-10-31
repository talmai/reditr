import React from 'react'
import { render } from 'react-dom'

import MediaParserView from './MediaParserView.js'

class StreamItemView extends React.Component {

    constructor(props) {
        super(props)

        // set default
        this.state = {
            voteCount: this.props.post.get("score")
        }
    }

    render() {

        let post = this.props.post

        return (
            <div key={this.props.key} className="stream-item-view">
                <span className="stream-item-vote-count">{post.get("score")}</span>
                <span className="stream-item-title">{post.get("title")}</span>
                <span className="stream-item-author">{post.get("author")}</span>
                <MediaParserView url={post.get("url")} />
            </div>
        )

    }

}

export default StreamItemView

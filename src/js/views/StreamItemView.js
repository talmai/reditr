import React from 'react'
import { render } from 'react-dom'

class StreamItemView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            voteCount: this.props.post.get("score")
        }
    }

    render() {

        let post = this.props.post

        return (
            <div key={this.props.key} className="stream-item-view">
                <span className="stream-item-title">{post.get("title")}</span>
                <span className="stream-item-author">{post.get("author")}</span>
                <span className="stream-item-vote-count">{post.get("score")}</span>
                {
                    (() => {
                        if (post.get("url").indexOf("imgur") != -1) {
                            return (<img src={post.get("url") + ".png"} className="stream-item-media" />)
                        }
                    }.call())
                }
            </div>
        )

    }

}

export default StreamItemView

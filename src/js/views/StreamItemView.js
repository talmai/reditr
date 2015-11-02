import React from 'react'
import { render } from 'react-dom'

import MediaParserView from './MediaParserView.js'
import reddit from '../api/reddit.js'
import CommentModel from '../models/CommentModel.js'
import StreamCommentView from './StreamCommentView.js'

class StreamItemView extends React.Component {

    constructor(props) {
        super(props);

        this.redditApi = new reddit();

        // set default
        this.state = {
            voteCount: this.props.post.get("score"),
            topComments: []
        }
    }

    componentDidMount() {
        this.loadComments();
    }

    loadComments() {
        this.redditApi.getCommentsFromPermalink(this.props.post.get("permalink"), null, (err, data) => {

            let comments = data.body[1].data.children;

            this.setState({
                topComments: [
                    comments[0],
                    comments[1]
                ]
            });
        });
    }

    render() {

        let post = this.props.post;

        let topComments = this.state.topComments;
        let commentsView = [];

        // if no comments, say no comments, WARNING: MUST HANDLE CASE WHERE WE ARE JUST LOADING
        if (topComments.length == 0) {
            commentsView = <span className="no-comments">No top comments!</span>;
        } else {
            topComments.forEach(comment => {
                let commentObj = new CommentModel(comment);
                commentsView.push(<StreamCommentView key={commentObj.get("id")} comment={commentObj} />);
            });
        }

        return (
            <div key={this.props.key} className="stream-item-view">
                <div className="stream-item-content">
                    <span className="stream-item-vote-count">{post.get("score")}</span>
                    <span className="stream-item-title">{post.get("title")}</span>
                    <span className="stream-item-author">{post.get("author")}</span>
                    <MediaParserView url={post.get("url")} />
                </div>

                <div className="stream-item-comments">
                    {commentsView}
                </div>
            </div>
        )

    }

}

export default StreamItemView

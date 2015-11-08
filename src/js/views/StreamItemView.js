import React from 'react';
import { render } from 'react-dom';
import MediaParserView from './MediaParserView.js';
import reddit from '../api/reddit.js';
import CommentModel from '../models/CommentModel.js';
import StreamCommentView from './StreamCommentView.js';
import { Link } from 'react-router';

class StreamItemView extends React.Component {

    constructor(props) {
        super(props);

        // set default
        this.state = {
            voteCount: this.props.post.get("score"),
            topComments: [],
            isLoading: true
        }
    }

    componentDidMount() {
        this.loadComments();
    }

    loadComments() {
        reddit.getPostFromPermalink(this.props.post.get("permalink"), null, (err, data) => {
            let comments = data.body[1].data.children;
            var topComments = [];
            if(comments[0]) topComments.push(comments[0]);
            if(comments[1]) topComments.push(comments[1]);
            this.setState({ isLoading: false, topComments: topComments });
        });
    }

    render() {

        let post = this.props.post; // typeof = PostModel

        let topComments = this.state.topComments;
        let commentsView = [];

        // if no comments, say no comments
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
                    <a href={post.get("url")} target="_blank" className="stream-item-title">{post.get("title")}</a>
                    <span className="stream-item-domain">({post.get("domain")})</span>
                    <span className="stream-item-vote-count">{post.get("score")}</span>
                    <MediaParserView url={post.get("url")} post={post} />
                    <div className="mini-details">
                        <span className="stream-item-author">{post.get("author")}</span> in <Link to={"/r/" + post.get("subreddit")} className="stream-item-subreddit">{"/r/" + post.get('subreddit')}</Link>
                    </div>
                </div>
                {
                    (
                        () => {
                            if (this.state.isLoading) {
                                return (
                                    <div className="stream-item-comments">
                                        <div className="loading">Loading...</div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="stream-item-comments">
                                        {commentsView}
                                        <Link to={post.get("permalink")} className="view-more-comments">View More Comments</Link>
                                    </div>
                                )
                            }
                        }
                    )()
                }
            </div>
        );

    }

}

export default StreamItemView;

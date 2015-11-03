import React from 'react';

import PostModel from '../models/PostModel.js';
import MediaParserView from './MediaParserView.js';
import reddit from '../api/reddit.js';
import PostCommentView from './PostCommentView.js';
import CommentModel from '../models/CommentModel.js';

class PostView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            post: null,
            comments: [],
            loading: true
        };
    }

    componentDidMount() {
        this.load();
    }

    load() {
        reddit.getPostFromPermalink(window.location.pathname, null, (err, data) => {
            this.setState({
                post: new PostModel(data.body[0].data.children[0]),
                comments: data.body[1].data.children,
                loading: false
            });
        });
    }

    render() {
        if (this.state.loading)
            return <div>Loading</div>;

        let post = this.state.post;
        let comments = this.state.comments;

        let commentViews = [];
        comments.forEach(comment => {

                console.log(comment.kind)
            if (comment.kind != "more") {
                let commentObj = new CommentModel(comment);
                commentViews.push(<PostCommentView key={commentObj.get("id")} comment={commentObj} />);
            }
        });

        return (
            <div className="post-view">
                <div className="post-content">
                    <span className="post-vote-count">{post.get("score")}</span>
                    <a href={reddit.baseUrl + post.get("permalink")} target="_blank" className="post-title">{post.get("title")}</a>
                    <span className="post-author">{post.get("author")}</span>
                    <MediaParserView url={post.get("url")} />
                </div>
                <div className="post-separator"></div>
                <div className="post-comments">
                    {commentViews}
                </div>
            </div>
        );
    }
}

export default PostView

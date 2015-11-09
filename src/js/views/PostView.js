import React from 'react';

import PostModel from '../models/PostModel';
import MediaParserView from './MediaParserView';
import reddit from '../api/reddit';
import PostCommentView from './PostCommentView';
import CommentModel from '../models/CommentModel';

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
            if (comment.kind != "more") {
                let commentObj = new CommentModel(comment);
                commentViews.push(<PostCommentView key={commentObj.get("id")} comment={commentObj} />);
            }
        });

        return (
            <div className="post-view">
                <div className="post-content">
                    <span className="post-vote-count">{post.get("score")}</span>
                    <a href={post.get("url")} target="_blank" className="post-title">{post.get("title")}</a>
                    <span className="post-author">{post.get("author")}</span>
                    <MediaParserView url={post.get("url")} post={post} />
                </div>
                <div className="post-separator"></div>
                <div className="post-comments">
                    {commentViews}
                </div>
            </div>
        );
    }
}

export default PostView;

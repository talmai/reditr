import React from 'react';
import { render } from 'react-dom';
import MediaParserView from './MediaParserView';
import reddit from '../api/reddit.js';
import CommentModel from '../models/CommentModel';
import StreamCommentView from './StreamCommentView';
import Link from './Link';
import { prettyNumber } from '../Utilities';
import moment from 'moment';

class StreamItemView extends React.Component {

    constructor(props) {
        super(props);

        // set default
        this.state = {
            voteCount: this.props.post.get("score"),
            topComments: [],
            isLoading: true,
            showNSFW: false
        };
    }

    componentDidMount() {
        this.loadComments();
    }

    loadComments() {
        let permalink = this.props.post.get("permalink");

        if (permalink) {
            // if permalink exists, proceed
            reddit.getPostFromPermalink(this.props.post.get("permalink"), null, (err, data) => {
                let comments = data.body[1].data.children;
                let maxComments = Math.min(comments.length, 5);
                var first, second;
                for(var i = 0; i < maxComments; i++) {
                    var checking = comments[i];
                    if(checking.data.body == '[removed]') continue;
                    if(!first) {
                        first = checking;
                    }else if(!second) {
                        second = checking;
                    }else{
                        var newFirst = first.data.body.length < second.data.body.length ? first : second;
                        var rejected = newFirst == first ? second : first;
                        first = newFirst;
                        second = rejected.data.body.length < checking.data.body.length ? rejected : checking;
                    }
                }
                var topComments = [];
                if(first) topComments.push(first);
                if(second) topComments.push(second);
                this.setState({ isLoading: false, topComments: topComments });
            });
        } else {
            this.setState({ isLoading: false, topComments: [] });
        }

    }

    enableNSFW() {
        this.setState({
            showNSFW: true
        });
    }

    render() {

        let post = this.props.post; // typeof = PostModel

        // WARN: if it is a comment, ignore for now
        if (post.kind == "t1") {
            return false;
        }

        let topComments = this.state.topComments;
        let commentsView = [];

        // if no comments, say no comments
        if (topComments.length == 0) {
            commentsView = <span className="no-comments">No comments!</span>;
        } else {
            var commentCount = post.get("num_comments");
            topComments.forEach(comment => {
                commentCount--;
                let commentObj = new CommentModel(comment);
                commentsView.push(<StreamCommentView key={commentObj.get("id")} comment={commentObj} />);
            });
            commentCount = commentCount <= 0 ? '' : prettyNumber(commentCount);
            commentsView.push(<Link key="more" text={post.get("title")} to={post.get("permalink")} className="view-more-comments">
                                  <div className='icon'>{commentCount} More Comments</div>
                              </Link>);
        }

        let postMedia = false;
        if (post.get("over_18") && !this.state.showNSFW) {
            postMedia = <div onClick={this.enableNSFW.bind(this)} className="nsfw-btn">Show NSFW Content</div>;
        } else {
            postMedia = <MediaParserView url={post.get("url")} post={post} />
        }

        return (
            <div key={this.props.key} className="stream-item-view">
                <div className="stream-item-top">
                    <div className="stream-item-sidebar">
                        <span className="stream-item-vote-count">{post.get("score")}</span>
                    </div>
                    <div className="stream-item-content">
                        <a href={post.get("url")} target="_blank" className="stream-item-title">{post.get("title")}</a>
                        <span className="stream-item-domain">({post.get("domain")})</span>
                        {postMedia}
                        <div className="mini-details">
                            <span className="stream-item-author">{post.get("author")}</span>
                            <span> posted in </span>
                            <Link to={"/r/" + post.get("subreddit")} className="stream-item-subreddit">{"/r/" + post.get('subreddit')}</Link>
                            <span> {moment.unix(post.get("created_utc")).fromNow()}</span>
                        </div>
                    </div>
                </div>
                <div className="stream-item-comments">
                    { this.state.isLoading ? <div className="loading">Loading...</div> : commentsView }
                </div>
            </div>
        );

    }

}

export default StreamItemView;

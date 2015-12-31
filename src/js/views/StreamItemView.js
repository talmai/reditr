import React from 'react';
import { render } from 'react-dom';
import MediaParserView from './MediaParserView';
import reddit from '../api/reddit';
import CommentModel from '../models/CommentModel';
import StreamCommentView from './StreamCommentView';
import Link from './Link';
import { prettyNumber } from '../utilities/Common';
import moment from 'moment';

class StreamItemView extends React.Component {

    constructor(props) {
        super(props);
        
        // get the vote direction
        let voteDir = 0;

        switch (this.props.post.get("likes")) {
            case null:
                voteDir = 0;
                break;
            case true:
                voteDir = 1;
                break;
            case false:
                voteDir = -1;
                break;
        }

        // set default
        this.state = {
            voteCount: this.props.post.get("score"),
            topComments: [],
            isLoading: true,
            showNSFW: false,
            voteDirection: voteDir
        };

        if(this.props.postIds) {
            this.props.postIds[this.props.post.get("id")] = this;
        }
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

    didUpvote() {
        // default to upvote
        let newVoteDir = this.state.voteDirection == -1 ? 0 : -1;
        let voteDelta = 1;

        switch (this.state.voteDirection) {
            case 1:
                newVoteDir = 0;
                voteDelta = -1;
                break;
            case -1:
                newVoteDir = 1;
                voteDelta = 2;
                break;
            case 0:
                newVoteDir = 1;
                voteDelta = 1;
                break;
        }

        this.setState({
            voteCount: this.state.voteCount + voteDelta,
            voteDirection: newVoteDir
        });
    }

    didDownvote() {
        // default to down
        let newVoteDir = this.state.voteDirection == -1 ? 0 : -1;
        let voteDelta = 1;

        switch (this.state.voteDirection) {
            case 1:
                newVoteDir = -1;
                voteDelta = -2;
                break;
            case -1:
                newVoteDir = 0;
                voteDelta = 1;
                break;
            case 0:
                newVoteDir = -1;
                voteDelta = -1;
                break;
        }

        this.setState({
            voteCount: this.state.voteCount + voteDelta,
            voteDirection: newVoteDir
        });
    }

    enableNSFW() {
        this.setState({
            showNSFW: true
        });
    }

    didDisappear(post) {
        this.setState({ hidden: true, height: post.clientHeight });
    }

    didAppear() {
        //console.log('back', this.props.post.get('title'));
        this.setState({ hidden: false });
    }

    render() {

        let post = this.props.post;

        // WARN: if it is a comment, ignore for now
        if (post.kind == "t1") {
            return false;
        }

        let style = this.state.height ? { minHeight: this.state.height } : {};
        if(this.state.hidden) {
            return <div style={style}
                        key={this.props.key}
                        className="stream-item-view hidden"
            data-postid={post.get("id")}>
                <div className="stream-item-top">
                    <div className="stream-item-sidebar">
                        <span className="stream-item-vote-count">{post.get("score")}</span>
                    </div>
                    <div className="stream-item-content">
                <a href={post.get("url")} target="_blank" className="stream-item-title">{post.get("title")}</a>
                </div>
                </div>
                   </div>;
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
        } else if(this.state.hidden) {
            postMedia = false;
        }else {
            postMedia = <MediaParserView url={post.get("url")} post={post}/>;
        }

        let upvoteClass = "up vote";
        let downvoteClass = "down vote";
        switch (this.state.voteDirection) {
            case 1:
                upvoteClass += " selected";
                break;
            case -1:
                downvoteClass += " selected";
                break;
        }

        return (
            <div style={style} key={this.props.key} className="stream-item-view" data-postid={post.get("id")}>
                <div className="stream-item-top">
                    <div className="stream-item-sidebar">
                        <div className={upvoteClass} onClick={this.didUpvote.bind(this)}></div>
                        <span className="stream-item-vote-count">{this.state.voteCount}</span>
                        <div className={downvoteClass} onClick={this.didDownvote.bind(this)}></div>
                    </div>
                    <div className="stream-item-content">
                        <a href={post.get("url")} target="_blank" className="stream-item-title">{post.get("title")}</a>
                <span className="stream-item-domain">({post.get("domain")})</span>
                {postMedia}
                        <div className="mini-details">
                            <Link to={"/user/" + post.get("author")} className="stream-item-author">{post.get("author")}</Link>
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

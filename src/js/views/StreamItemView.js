import React from 'react';
import { render } from 'react-dom';
import MediaParserView from './MediaParserView';
import reddit from '../api/reddit';
import CommentModel from '../models/CommentModel';
import StreamCommentView from './StreamCommentView';
import Link from './Link';
import { prettyNumber } from '../utilities/Common';
import moment from 'moment';
import MediaParser from '../utilities/MediaParser';
import Observable from '../utilities/Observable';

// material ui
import Card from 'material-ui/lib/card/card';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import List from 'material-ui/lib/lists/list';
import Divider from 'material-ui/lib/divider';
import ListItem from 'material-ui/lib/lists/list-item';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import IconButton from 'material-ui/lib/icon-button';
import CardActions from 'material-ui/lib/card/card-actions';
import FontIcon from 'material-ui/lib/font-icon';
import Colors from 'material-ui/lib/styles/colors';

import Theme from '../Theme.js';

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
            voteDirection: voteDir,
            forceHide: false
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

        // vote to reddit plz
        reddit.vote(newVoteDir, this.props.post.get("name"));

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

        // vote to reddit plz
        reddit.vote(newVoteDir, this.props.post.get("name"));

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

    openPostView() {
        Observable.global.trigger('pushNav', { href: this.props.post.get("permalink") });
    }

    render() {

        if (this.state.forceHide) {
            return false;
        }

        let post = this.props.post;

        // WARN: if it is a comment, ignore for now
        if (post.kind == "t1") {
            return false;
        }

        // WARN: temporary solution for text postIds
        MediaParser.parse(post.get("url"), media => {
            let exemptions = ["tweet", "text", "article", "gallery", "youtube"];

            if (exemptions.indexOf(media.type) > -1) {
                this.setState({
                    forceHide: true
                });
            }
        });

        let title = <a target="_blank" href={post.get("url")}>{post.get("title") + " (" + post.get("domain") + ")"}</a>;

        let subtitle = (
            <span>
                <Link to={"/u/" + post.get("author")}>{post.get("author")}</Link>
                &nbsp;in&nbsp;
                 <Link to={"/r/" + post.get("subreddit")}>{"/r/" + post.get("subreddit")}</Link>
                 &nbsp;{moment.unix(post.get("created_utc")).fromNow()}
            </span>
        );

        let postMedia = false;
        let moreOptions = false;
        if (post.get("over_18") && !this.state.showNSFW) {
            postMedia = <div></div>;
            moreOptions = (
                <CardActions style={{ float: "left", padding: 14 }}>
                    <FlatButton onTouchTap={this.enableNSFW.bind(this)} style={{ color: Colors.red500 }} label="Show NSFW" />
                </CardActions>
            );
        } else if(this.state.hidden) {
            postMedia = false;
        } else {
            postMedia = <MediaParserView url={post.get("url")} post={post}/>;
        }

        let upvoteIconColor = Colors.darkBlack;
        let downvoteIconColor = Colors.darkBlack;
        switch (this.state.voteDirection) {
            case 1:
                upvoteIconColor = Theme.palette.upvoteColor;
                break;
            case -1:
                downvoteIconColor = Theme.palette.downvoteColor;
                break;
        }

        let topComments = this.state.topComments;
        let commentsView = [];

        // if no comments, say no comments
        if (topComments.length == 0) {
            commentsView = <ListItem primaryText="No comments!" />;
        } else {
            var commentCount = post.get("num_comments");
            topComments.forEach((comment, index) => {
                commentCount--;
                let commentObj = new CommentModel(comment);
                commentsView.push(<StreamCommentView key={commentObj.get("id")} comment={commentObj} />);
                commentsView.push(<Divider key={index} />);
            });
            commentCount = commentCount <= 0 ? '' : prettyNumber(commentCount);
            commentsView.push(
                <FlatButton onTouchTap={this.openPostView.bind(this)} labelPosition="after" style={{ width: "100%" }} key="more" label={commentCount + " More Comments"}>
                    <FontIcon style={{ top: 5, left: 8, fontSize: 20, color: Colors.grey800 }} className="material-icons">comment</FontIcon>
                </FlatButton>
            )
            // commentsView.push(<Link key="more" text={post.get("title")} to={post.get("permalink")} className="view-more-comments">
            //                       <div className='icon'></div>
            //                   </Link>);
        }

        let style = this.state.height ? { minHeight: this.state.height } : {};
        if(this.state.hidden) {
            return (
                <Card style={style} key={this.props.key} className="stream-item-view" data-postid={post.get("id")}>
                    <CardMedia className="stream-item-media"
                        overlay={<CardTitle className="stream-title" title={title} subtitle={subtitle}/>}>
                    </CardMedia>
                    <div className="stream-item-controls">
                        {moreOptions}
                        <CardActions style={{ float: "right" }} className="vote-container">
                            <IconButton onTouchTap={this.didUpvote.bind(this)}>
                                <FontIcon color={upvoteIconColor} className="material-icons">keyboard_arrow_up</FontIcon>
                            </IconButton>
                            <IconButton onTouchTap={this.didDownvote.bind(this)}>
                                <FontIcon color={downvoteIconColor} className="material-icons">keyboard_arrow_down</FontIcon>
                            </IconButton>
                        </CardActions>
                        <div style={{clear: "both"}} />
                    </div>
                    <Divider style={{ width: "100%" }} />
                    <div className="top-comments">
                        { this.state.isLoading ? <ListItem primaryText="Loading..." /> : commentsView }
                    </div>
                </Card>
            );
        }

        return (
            <Card style={style} key={this.props.key} className="stream-item-view" data-postid={post.get("id")}>
                <CardMedia className="stream-item-media"
                    overlay={<CardTitle className="stream-title" title={title} subtitle={subtitle}/>}>
                    {postMedia}
                </CardMedia>
                <div className="stream-item-controls">
                    {moreOptions}
                    <CardActions style={{ float: "right" }} className="vote-container">
                        <IconButton onTouchTap={this.didUpvote.bind(this)}>
                            <FontIcon color={upvoteIconColor} className="material-icons">keyboard_arrow_up</FontIcon>
                        </IconButton>
                        <IconButton onTouchTap={this.didDownvote.bind(this)}>
                            <FontIcon color={downvoteIconColor} className="material-icons">keyboard_arrow_down</FontIcon>
                        </IconButton>
                    </CardActions>
                    <div style={{clear: "both"}} />
                </div>
                <Divider style={{ width: "100%" }} />
                <div className="top-comments">
                    { this.state.isLoading ? <ListItem primaryText="Loading..." /> : commentsView }
                </div>
            </Card>
        );

    }

}

export default StreamItemView;

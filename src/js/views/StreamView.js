import React from 'react';
import ReactDOM from 'react-dom';

import reddit from '../api/reddit';
import StreamItemView from './StreamItemView';
import StreamSpinnerView from './StreamSpinnerView';
import PostModel from '../models/PostModel';
import Observable from '../api/Observable';

class StreamView extends React.Component {

    constructor(props) {
        super(props);

        this.defaultSubreddit = "all";

        // temporarily assume all to be the default sub
        let subreddit = this.props.params.subreddit || this.defaultSubreddit;

        // if a router created us then we must be the "main view" and need to
        // offer up a title and path to this page for the breadcrumb
        if(props.route) {
            Observable.global.trigger('offerBreadcrumb', {
                href: '/r/'+subreddit,
                text: subreddit == this.defaultSubreddit ? 'Frontpage' : '/r/' + subreddit
            });
        }

        this.state = {
            subreddit: subreddit,
            posts: [],
            sort: "hot",
            after: null,
            isLoading: false
        };

    }

    removeDuplicatePosts(posts) {
        let seen = {};
        let finalArray = [];
        posts.forEach(post => {
            if (seen[post.data.id] !== 1) {
                seen[post.data.id] = 1;
                finalArray.push(post);
            }
        });
        return finalArray;
    }

    load(subreddit = this.state.subreddit, options = { reset: false }) {
        if (this.state.isLoading && !options.reset) return;

        var state;
        if (options.reset) {
            state = {
                subreddit: subreddit,
                posts: [],
                sort: "hot",
                after: null,
                isLoading: true,
                notFound: false
            };
        }else{
            state = {
                isLoading: true,
                notFound: false
            };
        }

        this.setState(state, () => {
            // retreive the posts
            var options = { sort: this.state.sort, after: this.state.after };
            reddit.getPostsFromSubreddit(subreddit, options, (err, posts) => {
                // subreddit not found
                if (!posts || !posts.body) {
                    this.setState({ subreddit: subreddit, notFound: true, isLoading: false });
                    return;
                }
                // update state to re render
                let newPosts = posts.body.data.children;
                let oldPosts = this.state.posts;
                oldPosts.push(...newPosts);

                let filteredPosts = this.removeDuplicatePosts(oldPosts);
                let lastPost = filteredPosts[filteredPosts.length - 1];
                this.setState({
                    subreddit: subreddit,
                    posts: filteredPosts,
                    after: posts.body.data.after,
                    isLoading: false
                });
            });
        });
    }

    componentWillReceiveProps(props) {
        this.load(props.params.subreddit, { reset: true }); // loads new prop info
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    componentDidMount() {
        this.attachScrollListener();
        // load the posts
        this.load();
    }

    scrollListener() {
        let node = ReactDOM.findDOMNode(this);
        // detect scrolling to the bottom
        if (node.scrollHeight - (node.scrollTop + node.offsetHeight) < 100) {
            this.load();
        }
    }

    attachScrollListener() {
        let node = ReactDOM.findDOMNode(this);
        node.addEventListener('scroll', this.scrollListener.bind(this));
        node.addEventListener('resize', this.scrollListener.bind(this));
    }

    detachScrollListener() {
        let node = ReactDOM.findDOMNode(this);
        node.removeEventListener('scroll', this.scrollListener.bind(this));
        node.removeEventListener('resize', this.scrollListener.bind(this));
    }

    render() {

        let postViews = [];
        if(this.state.posts) {
        this.state.posts.forEach(post => {
            let postObj = new PostModel(post);
            postViews.push(<StreamItemView key={postObj.get('id')} post={postObj} />);
        });
        }

        var loading = this.state.isLoading ? <StreamSpinnerView/> : false;
        var notFound = this.state.notFound ? <div>Subreddit {this.state.subreddit} does not exist.</div> : false;

        return (
            <div className="stream-view">
                {postViews}
                {loading}
                {notFound}
            </div>
        );
    }

}

export default StreamView;

import React from 'react';
import ReactDOM from 'react-dom';

import reddit from '../api/reddit';
import StreamItemView from './StreamItemView';
import StreamSpinnerView from './StreamSpinnerView';
import PostModel from '../models/PostModel';
import Observable from '../utilities/Observable';

class StreamView extends React.Component {

    constructor(props) {
        super(props);

        let params = this.props.params;
        if (params.subreddit) {
            this.handleSubreddit()
        } else if (params.user) {
            this.handleUser();
        } else {
            this.handleSubreddit()
        }
    }

    handleUser() {

        let { query } = this.props.location;

        this.defaults = {
            sortType: "hot",
            period: "all"
        };

        let user = this.props.params.user;
        let sortType = this.props.params.sort || this.defaults.sortType;
        let period = query.t || this.defaults.period;

        if(this.props.route) {
            Observable.global.trigger('offerBreadcrumb', {
                href: window.location.href.indexOf('/u/') >= 0
                        || window.location.href.indexOf('/user/') ? "/user/" + user : '/',
                text: user
            });
        }

        this.state = {
            user: user,
            posts: [],
            sort: sortType,
            period: period,
            after: null,
            isLoading: false
        };

    }

    handleSubreddit() {

        let { query } = this.props.location;

        this.defaults = {
            subreddit: "all",
            sortType: "hot",
            period: "all"
        };

        // temporarily assume all to be the default sub
        let subreddit = this.props.params.subreddit || this.defaults.subreddit;
        let sortType = this.props.params.sort || this.defaults.sortType;
        let period = query.t || this.defaults.period;

        // if a router created us then we must be the "main view" and need to
        // offer up a title and path to this page for the breadcrumb
        if(this.props.route) {
            Observable.global.trigger('offerBreadcrumb', {
                href: window.location.href.indexOf('/r/') >= 0 ? '/r/'+subreddit : '/',
                text: subreddit == this.defaultSubreddit ? 'Frontpage' : '/r/' + subreddit
            });
        }

        this.state = {
            subreddit: subreddit,
            posts: [],
            sort: sortType,
            period: period,
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

    loadUser(user = this.state.user, options = { reset: false }) {
        if (this.state.isLoading && !options.reset) return;

        var state = {};
        if (options.reset) {
            state = {
                user: user,
                posts: [],
                sort: this.defaults.sortType,
                period: this.defaults.period,
                after: null,
                isLoading: true,
                notFound: false
            };
        } else {
            state = {
                isLoading: true,
                notFound: false
            };
        }

        this.setState(state, () => {
            // retreive the posts
            var options = { sort: this.state.sort, after: this.state.after, t: this.state.period };
            reddit.getPostsFromUser(user, options, (err, posts) => {
                // subreddit not found
                if (!posts || !posts.body) {
                    this.setState({ user: user, notFound: true, isLoading: false });
                    return;
                }
                // update state to re render
                let newPosts = posts.body.data.children;
                let oldPosts = this.state.posts;
                oldPosts.push(...newPosts);

                let filteredPosts = this.removeDuplicatePosts(oldPosts);
                let lastPost = filteredPosts[filteredPosts.length - 1];
                this.setState({
                    user: user,
                    posts: filteredPosts,
                    after: posts.body.data.after,
                    isLoading: false
                });
            });
        });
    }

    load(subreddit = this.state.subreddit, options = { reset: false }) {
        if (this.state.isLoading && !options.reset) return;

        var state = {};
        if (options.reset) {
            state = {
                subreddit: this.defaults.subreddit,
                posts: [],
                sort: this.defaults.sortType,
                period: this.defaults.period,
                after: null,
                isLoading: true,
                notFound: false
            };
        } else {
            state = {
                isLoading: true,
                notFound: false
            };
        }

        this.setState(state, () => {
            // retreive the posts
            var options = { sort: this.state.sort, after: this.state.after, t: this.state.period };
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
        if (this.props.params.user) {
            this.loadUser(props.params.user, { reset: true });
        } else {
            this.load(props.params.subreddit, { reset: true }); // loads new prop info
        }
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    componentDidMount() {
        this.attachScrollListener();

        if (this.props.params.user) {
            this.loadUser();
        } else {
            // load the posts
            this.load();
        }
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

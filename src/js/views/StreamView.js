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

        if (params.subreddit || !params.user) {
            this.initForSubreddit();
        } else if (params.user) {
            this.initForUser();
        }

        var defaults = this.defaults;
        this.state = {
            subreddit: defaults.subreddit,
            postViews: [],
            postIds: {},
            sort: defaults.sortType,
            period: defaults.period,
            after: null,
            isLoading: false
        };

    }

    initForUser() {

        let { query } = this.props.location;

        this.defaults = {
            sortType: "hot",
            period: "all"
        };

        let user = this.props.params.user;
        let sortType = this.props.params.sort || this.defaults.sortType;
        let period = query.t || this.defaults.period;

        // if a router created us then we must be the "main view" and need to
        // offer up a title and path to this page for the breadcrumb
        if (this.props.route) {
            Observable.global.trigger('offerBreadcrumb', {
                href: window.location.href.indexOf('/u/') >= 0
                        || window.location.href.indexOf('/user/') ? "/user/" + user : '/',
                text: user
            });
        }

    }

    initForSubreddit() {

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
        if (this.props.route) {
            Observable.global.trigger('offerBreadcrumb', {
                href: window.location.href.indexOf('/r/') >= 0 ? '/r/'+subreddit : '/',
                text: subreddit == this.defaultSubreddit ? 'Frontpage' : '/r/' + subreddit
            });
        }

    }

    /* Creates StreamItemView views from array of post objects from reddit (redditPosts) and
     * appends them to the (optional) array appendToArray. (optional) array of post
     * ids postIdsHash prevents duplicate views from being inserted
     */

    createViewsFromRedditPosts(redditPosts, appendToArray = [], postIdsHash = {}) {
        for (var i in redditPosts) {
            let post = redditPosts[i];
            // avoid duplicate posts in the same feed
            if (postIdsHash[post.data.id]) continue;
            // insert post model/view into postViews - array of posts to render later
            let postObj = new PostModel(redditPosts[i]);
            appendToArray.push(<StreamItemView key={post.data.id} post={postObj} postIds={postIdsHash} />);
        }
        return appendToArray;
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
                this.createViewsFromRedditPosts(newPosts, this.state.postViews, this.state.postIds);

                this.setState({
                    user: user,
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

                // build new models and views here (prefer views built in render, speed sacrifice)
                let newPosts = posts.body.data.children;
                this.createViewsFromRedditPosts(newPosts, this.state.postViews, this.state.postIds);

                this.setState({
                    subreddit: subreddit,
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

    /* scroll management */

    didStopScrolling() {
        let node = ReactDOM.findDOMNode(this);
        if (node.scrollHeight - (node.scrollTop + node.offsetHeight) < 100) {
            // detect scrolling to the bottom and load more posts
            this.load();
        }
        // find elements off screen
        let postNodes = node.querySelectorAll('.stream-item-view');
        let startY = node.scrollTop - 8*node.offsetHeight;
        let endY = startY + 9*node.offsetHeight;
        let postIds = this.state.postIds;
        for (var i = 0; i < postNodes.length; i++) {
            var post = postNodes[i];
            if( (post.offsetTop + post.clientHeight) < startY || post.offsetTop > endY ) {
                if(!post.classList.contains('hidden')) {
                    post.classList.add('hidden');
                    let postid = post.getAttribute('data-postid');
                    postIds[postid].didDisappear(post);
                }
            }else{
                if(post.classList.contains('hidden')) {
                    post.classList.remove('hidden');
                    let postid = post.getAttribute('data-postid');
                    postIds[postid].didAppear(post);
                }
            }
        }
    }

    scrollListener() {
        clearTimeout(this.stopScrollingTimeout);
        this.stopScrollingTimeout = setTimeout(this.didStopScrolling, 200);
    }

    attachScrollListener() {
        this.didStopScrolling = this.didStopScrolling.bind(this);
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
        var loading = this.state.isLoading ? <StreamSpinnerView/> : false;
        var notFound = this.state.notFound ? <div>Subreddit {this.state.subreddit} does not exist.</div> : false;

        return (
            <div className="stream-view">
                {this.state.postViews}
                {loading}
                {notFound}
            </div>
        );
    }

}

export default StreamView;

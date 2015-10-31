import React from 'react'
import ReactDOM from 'react-dom'

import reddit from '../api/reddit.js'
import StreamItemView from './StreamItemView.js'
import PostModel from '../models/PostModel.js'

class StreamView extends React.Component {

    constructor(props) {
        super(props)

        // temporarily assume gaming to be the default sub
        let subreddit = this.props.params.subreddit || "gaming"
        this.state = {
            subreddit: subreddit,
            posts: [],
            sort: "hot",
            after: null,
            isLoading: false
        }

        // get the api
        this.redditApi = new reddit()

    }

    removeDuplicatePosts(posts) {
        let seen = {}
        let finalArray = []
        posts.forEach(post => {
            if (seen[post.data.id] !== 1) {
                seen[post.data.id] = 1
                finalArray.push(post)
            }
        })

        return finalArray
    }

    load(subreddit = this.state.subreddit) {
        if (this.state.isLoading) return

        this.setState({
            isLoading: true
        })
        // retreive the posts
        this.redditApi.getPostsFromSubreddit(subreddit, { sort: this.state.sort, after: this.state.after }, (err, posts) => {
            // update state to re render

            let newPosts = posts.body.data.children
            let oldPosts = this.state.posts
            oldPosts.push(...newPosts)

            let filteredPosts = this.removeDuplicatePosts(oldPosts)
            let lastPost = filteredPosts[filteredPosts.length - 1]
            this.setState({
                subreddit: subreddit,
                posts: filteredPosts,
                after: lastPost.kind + "_" + lastPost.data.id, // get last child
                isLoading: false
            })
        })
    }

    componentWillReceiveProps(props) {
        this.load(props.params.subreddit) // loads new prop info
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    componentDidMount() {
        this.attachScrollListener();
        // load the posts
        this.load()
    }

    componentDidUpdate() {
        this.attachScrollListener();
    }

    scrollListener() {
        let node = ReactDOM.findDOMNode(this)

        // detect scrolling to the bottom
        if (node.scrollHeight - (node.scrollTop + node.offsetHeight) < 100) {
            this.load()
        }
    }

    attachScrollListener() {
        let node = ReactDOM.findDOMNode(this)
        node.addEventListener('scroll', this.scrollListener.bind(this));
        node.addEventListener('resize', this.scrollListener.bind(this));
        this.scrollListener();
    }

    detachScrollListener() {
        let node = ReactDOM.findDOMNode(this)
        node.removeEventListener('scroll', this.scrollListener.bind(this));
        node.removeEventListener('resize', this.scrollListener.bind(this));
    }

    render() {

        let postViews = []
        this.state.posts.forEach(post => {
            let postObj = new PostModel(post)
            postViews.push(<StreamItemView key={postObj.get('id')} post={postObj} />)
        })

        return (
            <div className="stream-view">
                {postViews}
            </div>
        )
    }

}

export default StreamView

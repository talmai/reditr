import React from 'react'
import { render } from 'react-dom'

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
            posts: []
        }

        // get the api
        this.redditApi = new reddit()

        // load the posts
        this.load()
    }

    load(subreddit = this.state.subreddit) {
        // retreive the posts
        this.redditApi.getPostsFromSubreddit(subreddit, { sort: "hot" }, (err, posts) => {
            // update state to re render
            this.setState({
                subreddit: subreddit,
                posts: posts.body.data.children
            })
        })
    }

    componentWillReceiveProps(props) {
        this.load(props.params.subreddit) // loads new prop info
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

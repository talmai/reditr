import React from 'react'
import { render } from 'react-dom'

import reddit from '../api/reddit.js'
import StreamItemView from './StreamItemView.js'
import PostModel from '../models/PostModel.js'
import { Link } from 'react-router'

class StreamView extends React.Component {

    constructor(props) {
        super(props)

        let subreddit = this.props.params.subreddit || "gaming"
        this.state = {
            subreddit: subreddit,
            posts: []
        }

        this.redditApi = new reddit()
        this.load()
    }

    load(subreddit = this.state.subreddit) {
        this.redditApi.getPostsFromSubreddit(subreddit, {}, (err, posts) => {
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

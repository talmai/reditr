import React from 'react'
import { render } from 'react-dom'

import reddit from '../api/reddit.js'
import StreamItemView from './StreamItemView.js'
import PostModel from '../models/PostModel.js'

class StreamView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            subreddit: "gaming",
            posts: []
        }

        this.redditApi = new reddit()

        this.load()
    }

    load() {
        this.redditApi.getPostsFromSubreddit(this.state.subreddit, {}, (err, posts) => {
            this.setState({
                posts: posts.body.data.children
            })
        })
    }

    render() {

        let postViews = []
        this.state.posts.forEach(post => {
            let postObj = new PostModel(post)
            postViews.push(<StreamItemView key={postObj.get('id')} post={postObj} />)
        })

        return (
            <div key="what" className="StreamView">
                {postViews}
            </div>
        )
    }

}

export default StreamView

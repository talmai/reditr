import React from 'react'
import { render } from 'react-dom'

import reddit from '../api/reddit.js'

class StreamView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            subreddit: "reditr",
            posts: []
        }

        this.redditApi = new reddit()

        this.load()
    }

    load() {
        this.redditApi.getPostsFromSubreddit(this.state.subreddit, {}, function(err, res) {
            console.log(res)
        })
    }

    render() {
        return (<div className="StreamView" />)
    }

}

export default StreamView

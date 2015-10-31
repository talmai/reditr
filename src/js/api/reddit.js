import Request from 'superagent'

class reddit {

    constructor() {
        this.baseUrl = "https://reddit.com/"
    }

    getPostsFromSubreddit(subreddit, options, callback) {
        options = options || {}

        Request
            .get(this.baseUrl + 'r/' + subreddit + '.json')
            .end(callback);

    }

}

export default reddit

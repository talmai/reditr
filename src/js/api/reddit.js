import Request from 'superagent'

class reddit {

    constructor() {
        this.baseUrl = "https://reddit.com/"
    }

    getPostsFromSubreddit(subreddit, options, callback) {
        options = options || {}

        let jsonp = require('superagent-jsonp')

        Request
            .get(this.baseUrl + 'r/' + subreddit + '.json')
            .use(jsonp)
            .end(callback);

    }

}

export default reddit

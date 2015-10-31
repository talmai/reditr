import Request from 'superagent'

class reddit {

    constructor() {
        this.baseUrl = "https://www.reddit.com/"
    }

    getPostsFromSubreddit(subreddit, options, callback) {
        options = options || { sort: "hot" }

        Request
            .get(this.baseUrl + "r/" + subreddit + "/" + options.sort + ".json")
            .end(callback);

    }

}

export default reddit

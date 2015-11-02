import Request from 'superagent';

class reddit {

    constructor() {
        this.baseUrl = "https://www.reddit.com/";
        this.extension = ".json";
    }

    getPostsFromSubreddit(subreddit, options = { sort: "hot" }, callback) {

        Request
            .get(this.baseUrl
                + "r/"
                + subreddit
                + "/"
                + options.sort
                + this.extension)
            .query(options)
            .end(callback);

    }

    getCommentsFromPermalink(permalink, options = { sort: "hot" }, callback) {

        Request
            .get(this.baseUrl + permalink + this.extension)
            .query(options)
            .end(callback);

    }

}

export default new reddit;

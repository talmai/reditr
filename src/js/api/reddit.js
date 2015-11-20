import Request from 'superagent';
import OAuth from './OAuth';

class reddit {

    constructor() {
        this.baseUrl = "https://www.reddit.com";
        this.extension = ".json";
    }

    login(callback) {
        OAuth.start(user => {
            callback(user);
        });
    }

    getPostsFromSubreddit(subreddit, options = { sort: "hot" }, callback) {

        Request
            .get(this.baseUrl
                + "/r/"
                + subreddit
                + "/"
                + options.sort
                + this.extension)
            .query(options)
            .end(callback);

    }

    getPostFromPermalink(permalink, options = { sort: "hot" }, callback) {

        Request
            .get(this.baseUrl + permalink + this.extension)
            .query(options)
            .end(callback);

    }

}

export default new reddit;

import Request from 'superagent';
import OAuth from './OAuth';

class reddit {

    constructor() {
        this.baseUrl = "https://www.reddit.com";
        this.baseOAuthUrl = "https://oauth.reddit.com";
        this.extension = ".json";
        this.authUser = null;
    }

    setAuth(userObj) {
        this.authUser = userObj;
    }

    getCurrentAccountInfo(callback) {

        Request
            .get(this.baseOAuthUrl + "/api/v1/me" + this.extension)
            .set("Authorization", "bearer " + this.authUser.accessToken)
            .end(callback);

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

    getPostsFromUser(user, options = { sort: "hot" }, callback) {

        Request
            .get(this.baseUrl
                + "/user/"
                + user
                + "/"
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

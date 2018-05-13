import Request from 'superagent'
import OAuth from './OAuth'
import Promise from 'enhanced-promises'

const promiseAndCallback = (defer, callback, parser) => {
  return (err, result) => {
    if (err) {
      defer.reject(err)
      return callback && callback(err)
    }
    if (parser) {
      try {
        const parsedResult = parser(result)
        defer.resolve(parsedResult)
        return callback && callback(parsedResult)
      } catch (err) {
        defer.reject(err)
        return callback && callback(err)
      }
    }
    err ? defer.reject(err) : defer.resolve(result)
    callback && callback(err, result)
  }
}

class reddit {
  constructor() {
    this.baseUrl = 'https://www.reddit.com'
    this.unsecureBaseUrl = 'http://www.reddit.com'
    this.baseOAuthUrl = 'https://oauth.reddit.com'
    this.extension = '.json'
    this.proxy = 'http://reditr.com/api/sync/'
    this.authUser = null
  }

  setAuth(userObj) {
    this.authUser = userObj
  }

  getCurrentAccountInfo(callback) {
    return fetch(this.baseOAuthUrl + '/api/v1/me' + this.extension, {
      headers: new Headers({
        Authorization: 'bearer ' + this.authUser.accessToken
      })
    }).then(r => r.json())
  }

  getSubscribedSubreddits(callback) {
    const defer = Promise.defer()
    const path = this.authUser && this.authUser.accessToken ? '/subreddits/mine/subscriber' : '/subreddits/default'
    const base = this.authUser && this.authUser.accessToken ? this.baseOAuthUrl : this.baseUrl
    let request = Request.get(base + path + this.extension)
    if (this.authUser && this.authUser.accessToken) {
      request = request.set('Authorization', 'bearer ' + this.authUser.accessToken)
    }
    request.end(
      promiseAndCallback(defer, callback, data => {
        return data.body.data.children.map(child => child.data)
      })
    )
    return defer.promise
  }

  getPostsFromSubreddit(subreddit, options = { sort: 'hot' }, callback) {
    const baseUrl = this.authUser && this.authUser.accessToken ? this.baseOAuthUrl : this.baseUrl
    const req = Request.get(baseUrl + '/r/' + subreddit + '/' + options.sort + this.extension).query(options)

    if (this.authUser && this.authUser.accessToken) {
      req.set('Authorization', 'bearer ' + this.authUser.accessToken)
    }

    req.end(callback)
  }

  getPostsFromUser(user, options = { sort: 'hot' }, callback) {
    Request.get(this.baseUrl + '/user/' + user + '/' + this.extension)
      .set('Authorization', 'bearer ' + this.authUser.accessToken)
      .query(options)
      .end(callback)
  }

  getPostFromPermalink(permalink, options = { sort: 'hot' }, callback) {
    Request.get(this.baseUrl + permalink + this.extension)
      .query(options)
      .end(callback)
  }

  searchForSubredditsWithQuery(query, callback) {
    Request.get(this.baseUrl + '/subreddits/search' + this.extension)
      .query({ q: query })
      .end(callback)
  }

  getSubredditBio(subreddit, callback) {
    Request.get(this.baseUrl + '/r/' + subreddit + '/about' + this.extension).end(callback)
  }

  vote(dir, fullname, callback) {
    Request.post(this.baseOAuthUrl + '/api/vote')
      .set('Authorization', 'bearer ' + this.authUser.accessToken)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        id: fullname,
        dir: dir
      })
      .end(callback)
  }
}

export default new reddit()

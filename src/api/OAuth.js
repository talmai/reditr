import Request from 'superagent';

class OAuth {

  start(callback) {
    this.callback = callback;

    // get an identification number from reditr.com
    Request
      .get("http://reditr.com/api/sync/")
      .query({ oauth: "" })
      .end((err, response) => {

        // iden
        let identification = response.text;

        // open a window to reddit's oauth
        let oAuthWin = window.open('http://reditr.com/api/sync/?oauth=' + identification);

        // interval to check when window is closed so we can perform more actions
        let checkLoginInterval = setInterval(() => {
          // if window is closed, hit up reditr.com to see if oauth was successful
          if (!oAuthWin || oAuthWin.closed || typeof oAuthWin.closed == 'undefined') {
            clearInterval(checkLoginInterval);
            this.complete(identification);
          }
        }, 500);
      });
  }

  complete(iden) {

    // complete the oauth process
    Request
      .get("http://reditr.com/api/sync/")
      .query({ oauth: iden, revive: true })
      .end((err, response) => this.callback(response.body));
  }

  getAccessToken(user, callback) {
    if (!user.refreshKey) {
      callback()
      return
    }
    Request
      .get('http://reditr.com/api/sync/?getAccessToken')
      .query({ oauth: user.refreshKey })
      .end((err, response) => {
        let data = response.body;
        // make sure json
  			data = typeof data == 'string' ? JSON.parse(data) : data;

        callback(data.accesstoken);
      });

  }
}

export default new OAuth

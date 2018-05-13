import Request from 'superagent'

class OAuth {
  start() {
    return new Promise((resolve, reject) => {
      fetch('http://reditr.com/api/sync/?oauth=')
        .then(r => r.text())
        .then(identification => {
          // open a window to reddit's oauth
          const oAuthWin = window.open('http://reditr.com/api/sync/?oauth=' + identification)

          // interval to check when window is closed so we can perform more actions
          const checkLoginInterval = setInterval(() => {
            // if window is closed, hit up reditr.com to see if oauth was successful
            if (!oAuthWin || oAuthWin.closed || typeof oAuthWin.closed == 'undefined') {
              clearInterval(checkLoginInterval)
              this.complete(identification).then(resolve)
            }
          }, 500)
        })
    })
  }

  complete(iden) {
    return fetch(`http://reditr.com/api/sync/?oauth=${iden}&revive=true`).then(r => r.json())
  }

  getAccessToken(user) {
    return new Promise((resolve, reject) => {
      if (!user.refreshKey) {
        resolve()
      }

      fetch(`http://reditr.com/api/sync/?getAccessToken&oauth=${user.refreshKey}`)
        .then(r => r.json())
        .then(data => {
          resolve(data.accesstoken)
        })
    })
  }
}

export default new OAuth()

import Request from 'superagent';

class OAuth {

    constructor() {
        this.clientId = "P3OV-qUrp57Z8A"
        this.secret = "oZbplkCqnRj2mxVAWcwFEniatl8"
        this.scope = "identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread";
    }

    start(callback) {
        this.callback = callback

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
                    if (!oAuthWin.parent) {
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
            .end((err, response) => {
                // send the body to the callback and handle errors there
                this.callback(response.body)
            });
    }
}

export default new OAuth

var jsonp = (request) => {
    request.end = (finalCallback) => {
        try{
            let cbname = 'superagentCallback' + new Date().valueOf() + parseInt(Math.random() * 1000);
            let queryString = request._query.join('&');
	        let s = document.createElement('script');
	        let separator = (request.url.indexOf('?') > -1) ? '&': '?';
	        let url = (request.url + separator + queryString).replace('=?', '='+cbname);
            var headTag = document.getElementsByTagName('head')[0];
            window[cbname] = (body) => {
                delete window[cbname];
                headTag.removeChild(s);
                if(finalCallback) finalCallback(false, {body});
            };
	        s.src = url;
	        headTag.appendChild(s);
        }catch(e) {
            finalCallback(e, undefined);
        }
    };
    return request;
};

export default jsonp;

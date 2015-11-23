import createHistory from 'history/lib/createBrowserHistory';
import Observable from './utilities/Observable';

var history = createHistory({
  queryKey: false
});

// listen for the pushNav global event, and change the browser history when
// it occurs

Observable.global.on('pushNav', data => {
    if(!data.silent) history.pushState(null, data.href);
});

// detect when the browser moves forward and backward, and send off a pushNav
// event. Silent indicates that we wont change browser history, because
// in this case we're responding to a change and not creating one

history.listen(data => {
    if(data.action == 'POP') {
        Observable.global.trigger('pushNav', { href: data.pathname, silent: true });
    }
});

export default history;

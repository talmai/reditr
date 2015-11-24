class Observable {

    constructor() {
        this.listeners = {};
    }

    uuid() {
        return new Date().valueOf() + parseInt(Math.random() * 1000);
    }

    trackEventOnSelf(obj, token) {
        if(!obj.__observables) obj.__observables = [];
        obj.__observables.push(token);
    }

    on(self, event, callback) {
        if(!callback) {
            callback = event;
            event = self;
            self = undefined;
        }
        if(!this.listeners[event]) this.listeners[event] = {};
        var id = this.uuid();
        this.listeners[event][id] = self ? callback.bind(self) : callback;
        var token = [event, id];
        if(self) this.trackEventOnSelf(self, token);
        return token;
    }

    remove(token) {
        delete this.listeners[token[0]][token[1]];
    }

    removeAll(self) {
        if(!self.__observables) return;
        for(var i in self.__observables) this.remove(self.__observables[i]);
        delete self.__observables;
    }

    trigger(event, data) {
        var events = this.listeners[event];
        if(!events) return;
        for(var i in events) {
            events[i](data);
        }
    }

}

Observable.global = new Observable;

export default Observable;

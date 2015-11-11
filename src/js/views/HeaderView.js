import React from 'react';
import { render } from 'react-dom';
import Link from './Link';
import Observable from '../api/Observable';
import history from '../History';

class Logo extends React.Component {
    render() {
        return <img className="logo" src="images/logo.png" />;
    }
}

class HeaderView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.history = [];
        this.future = [];
        Observable.global.on(this, 'pushNav', this.onPushNav);
        Observable.global.on(this, 'offerBreadcrumb', this.onOfferBreadcrumb);
    }

    onOfferBreadcrumb(data) {
        if(this.history.length == 0) {
            this.onPushNav(data);
        }
    }

    onPushNav(data) {
        // go forward
        if(this.future.length > 0 && this.future[this.future.length-1].href == data.href) {
            this.history.push(this.future.pop());
        // go backward
        }else if(this.history.length > 1 && this.history[this.history.length-2].href == data.href) {
            this.future.push(this.history.pop());
        // go to new page
        }else{
            this.history.push(data);
            this.future = [];
        }
        this.setState({});
    }

    componentWillUnmount() {
        Observable.global.removeAll(this);
    }

    truncateTitle(title) {
        var words = title.split(' ');
        if(words.length <= 5) return title;
        var newTitle = [];
        for(var i = 0; i < 5; i++) newTitle.push(words[i]);
        return newTitle.join(' ') + '...';
    }

    render() {

        var text;

        var right = this.future[this.future.length-1];
        var rightObj = false;
        if(right) {
            text = this.truncateTitle(right.text || right.href) + ' »';
            rightObj = <Link className="header-view-text" to={right.href}>{text}</Link>;
        }

        var center = this.history[this.history.length-1] || false;
        var centerObj = false;
        if(center) {
            text = this.truncateTitle(center.text);
            centerObj = <Link className="header-view-text" to={center.href}>{text}</Link>;
        }

        var left = this.history[this.history.length-2] || false;
        var leftObj = <Logo/>;
        if(left) {
            text = '« ' + this.truncateTitle(left.text || left.href);
            leftObj = <Link className="header-view-text" to={left.href}>{text}</Link>;
        }

        return (
            <div id="HeaderView">
                <div className="header-view-left">
                    {leftObj}
                </div>
                <div className="header-view-center">
                    {centerObj}
                </div>
                <div className="header-view-right">
                    {rightObj}
                </div>
            </div>
        );
    }

}

export default HeaderView;

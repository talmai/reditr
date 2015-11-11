import Observable from '../api/Observable';
import React from 'react';

class Link extends React.Component {

    constructor(props) {
        super(props);
    }

    handleClick(e) {
        var href = this.props.to;
        var text = this.props.text || href;
        e.preventDefault();
        e.stopPropagation();
        Observable.global.trigger('pushNav', { href, text });
        return false;
    }

    render() {
        var href = this.props.to;
        var className = this.props.className || false;
        return (
            <a className={className} href={href} onClick={this.handleClick.bind(this)}>
                {this.props.children}
            </a>
        );
    }

}

export default Link;

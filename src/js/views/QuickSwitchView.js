import React from 'react';
import { Router, Link } from 'react-router';
import history from '../History.js';
import Observable from '../utilities/Observable';

class QuickSwitchView extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            
        }
    }

    componentDidMount() {
        this.refs["query-input"].focus();
    }

    queryChanged(e) {
        if(e.keyCode == 13) {
            let query = '/r/' + this.refs["query-input"].value;
            Observable.global.trigger('pushNav', { text: query, href: query });
            //history.pushState(null, '/r/' + query);
            if(this.props.onSubredditChanged) this.props.onSubredditChanged();
        }
    }

    render() {
        return (
            <div className="quick-switch-view">
                <div className="input-container">
                    <div className="type">
                        /r/
                    </div>
                    <input ref="query-input" onKeyUp={this.queryChanged.bind(this)}/>
                </div>
            </div>
        );
    }

}

export default QuickSwitchView;

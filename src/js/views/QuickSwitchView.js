import React from 'react';
import { Router, Link } from 'react-router';
import history from '../History.js';

class QuickSwitchView extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        this.refs["query-input"].focus();
    }

    queryChanged(e) {
        if(e.keyCode == 13) {
            let query = this.refs["query-input"].value;
            history.pushState(null, '/r/' + query);
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
                    <input ref="query-input" onKeyDown={this.queryChanged.bind(this)}/>
                </div>
            </div>
        );
    }

}

export default QuickSwitchView;

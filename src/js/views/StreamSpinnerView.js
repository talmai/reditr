import React from 'react';
import { render } from 'react-dom';

class StreamSpinnerView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="stream-spinner-view">
                <div className="pulse-loader">loading…</div>
            </div>
        );
    }

}

export default StreamSpinnerView;

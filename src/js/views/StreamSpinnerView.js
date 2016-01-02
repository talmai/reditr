import React from 'react';
import { render } from 'react-dom';

// material
import CircularProgress from 'material-ui/lib/circular-progress';

class StreamSpinnerView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <center><CircularProgress className="stream-spinner-view" mode="indeterminate" /></center>
        );
    }

}

export default StreamSpinnerView;

import React from 'react';
import { render } from 'react-dom';

class StreamSpinnerView extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <img src="images/loading.gif" className="stream-spinner-view" />
    );
  }

}

export default StreamSpinnerView;

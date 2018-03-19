import React from 'react'
import { render } from 'react-dom'

import loading from '../../images/loading.gif'

class StreamSpinnerView extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <img src={loading} className="stream-spinner-view" />
  }
}

export default StreamSpinnerView

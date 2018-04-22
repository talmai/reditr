import React from 'react'
import { render } from 'react-dom'

import style from '../../utilities/Style'
import loading from '../../images/loading.gif'

class StreamSpinnerView extends React.Component {
  static style() {
    return {
      container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1
      }
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className={this.props.classes.container}>
        <img src={loading} className="stream-spinner-view" />
      </div>
    )
  }
}

export default style(StreamSpinnerView)

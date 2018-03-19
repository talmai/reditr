import React from 'react'

import StreamView from '../StreamView'

export default class StreamContainer extends React.Component {
  constructor(props) {
    super(props)

    let params = (this.props.match && this.props.match.params) || {}

    this.state = {
      subreddit: params.subreddit,
      viewMode: 'column'
    }
  }

  render() {

    const isColumnMode = this.state.viewMode === 'column' && (!this.state.subreddit || this.state.subreddit === '')

    let styles = {
      container: {
        display: 'flex',
        height: isColumnMode ? '100%' : 'auto',
        overflow: 'hidden'
      }
    }

    if (isColumnMode) {
      styles.stream = {
        minWidth: '310px',
        maxHeight: '100%'
      }
    }

    return (
      <div style={styles.container}>
        <StreamView style={styles.stream} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} subreddit={this.state.subreddit} />
      </div>
    )
  }
}

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

    const isColumn = this.state.viewMode === 'column' && (!this.state.subreddit || this.state.subreddit === '')

    let styles = {
      container: {
        display: 'flex',
        overflowY: 'hidden',
        overflowX: 'scroll'
      }
    }

    if (isColumn) {
      styles.container = {
        ...styles.container,
        height: '100%',
        padding: '10px',
        boxSizing: 'border-box'
      }

      styles.stream = {
        minWidth: '310px',
        maxHeight: '100%',
        marginTop: 0,
        marginRight: '10px'
      }
    }

    return (
      <div style={styles.container}>
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
      </div>
    )
  }
}

import React from 'react'

import Store from '../../utilities/Store'
import reddit from '../../api/reddit'
import StreamView from '../StreamView'

export default class StreamContainer extends React.Component {
  constructor(props) {
    super(props)

    let params = (this.props.match && this.props.match.params) || {}

    this.state = {
      subreddit: params.subreddit || 'all',
      viewMode: 'column',
      subreddits: []
    }
  }

  componentDidMount() {
    const state = Store.get('stream-container')
    if (state) {
      this.setState(state)
    } else {
      this.getStreams()
    }
  }

  componentWillUnmount() {
    Store.save('stream-container', this.state)
  }

  getStreams = () => {
    reddit.getSubscribedSubreddits().then(list => {
      const subreddits = list.slice(0, 5).map(subreddit => ({
        name: subreddit.url.replace('/r/', '').slice(0, subreddit.url.length - 4)
      }))
      this.setState({ subreddits })
    })
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
        {isColumn ? (
          this.state.subreddits.map(subreddit => <StreamView key={subreddit.name} style={styles.stream} isColumn={isColumn} subreddit={subreddit.name} />)
        ) : (
          <StreamView style={styles.stream} isColumn={isColumn} subreddit={this.state.subreddit} />
        )}
      </div>
    )
  }
}

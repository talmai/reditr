import React from 'react'

import reddit from '../../api/reddit'
import StreamView from '../StreamView'

export default class StreamContainer extends React.Component {
  constructor(props) {
    super(props)

    let params = (this.props.match && this.props.match.params) || {}

    this.state = {
      subreddit: params.subreddit,
      viewMode: 'column',
      subreddits: []
    }
  }

  componentDidMount() {
    this.getStreams()
  }

  getStreams = () => {
    reddit.getSubscribedSubreddits().then(list => {
      const subreddits = list.map(subreddit => ({
        name: subreddit.url.replace('/r/', '').slice(0, subreddit.url.length - 4)
      }))
      this.setState({ subreddits })
    })
  }

  render() {
    const isColumn = this.state.viewMode === 'column' && !this.state.subreddit
   
    let styles = {
      container: {
        display: 'flex',
        overflowY: 'hidden',
        overflowX: 'scroll'
      },
      stream: {
        maxWidth: '900px',
        margin: '20px auto'
      }
    }

    if (isColumn) {
      styles.container = {
        ...styles.container,
        height: '100%',
        boxSizing: 'border-box'
      }

      styles.stream = {
        minWidth: '310px',
        maxHeight: '100%',
        marginTop: 0,
        marginRight: '5px'
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

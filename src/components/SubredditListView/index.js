import React from 'react'
import { Link } from 'react-router-dom'

import redditLogo from '../../images/reddit.png'

const ListItemView = props => {
  const displayName = props.subreddit.url.replace('/', '')
  const styles = {
    container: {
      display: 'flex',
      width: '100%',
      padding: '5px 10px',
      alignItems: 'center',
      height: '30px'
    },
    image: {
      width: '30px',
      marginRight: '10px'
    }
  }

  return (
    <Link to={'/' + displayName} style={styles.container}>
      <img style={styles.image} src={props.subreddit.icon_img !== "" ? props.subreddit.icon_img : redditLogo} />
      {displayName}
    </Link>
  )
}

class SubredditListView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subreddits: []
    }
  }

  render() {

    const styles = {
      container: {
        height: '100%',
        overflow: 'scroll',
        padding: '20px',
        boxSizing: 'border-box'
      }
    }

    return (
      <div style={styles.container} className="subreddit-list">
        {this.props.subreddits.map(subreddit => (
          <ListItemView subreddit={subreddit} key={subreddit.url} />
        ))}
      </div>
    )
  }
}

export default SubredditListView

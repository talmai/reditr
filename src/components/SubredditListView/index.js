import React from 'react'
import style from '../../utilities/Style'
import ListItemView from './ListItemView'

const SubredditListView = style(class extends React.Component {

  static style() {
    return {
      root: {
        height: '100%',
        overflow: 'scroll',
        padding: '20px',
        boxSizing: 'border-box'
      }
    }
  }

  componentWillReceiveProps(newProps) {
    if (JSON.stringify(newProps.subreddits) !== JSON.stringify(this.props.subreddits)) {
      this.animateSubreddits()
    }
  }

  componentDidMount() {
    this.animateSubreddits()
  }

  constructor(props) {
    super(props)
    this.state = {
      subreddits: [],
      subredditsAnimated: []
    }
  }

  animateSubreddits() {
    clearInterval(this.interval)
    this.setState({
      subredditsAnimated: []
    })
    let count = 0
    const subredditsAnimated = []
    this.interval = setInterval(() => {
      if (count >= this.props.subreddits.length) {
        clearInterval(this.interval)
        return
      }
      subredditsAnimated[count++] = true
      this.setState({ subredditsAnimated })
    }, 30 / this.props.subreddits.length)
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        {this.props.subreddits.map((subreddit, i) => (
          <ListItemView
            animateIn={this.state.subredditsAnimated[i]}
            subreddit={subreddit}
            key={subreddit.url} />
        ))}
      </div>
    )
  }

})

export default SubredditListView

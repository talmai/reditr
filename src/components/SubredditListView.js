import React from 'react';

const ListItemView = (props) => {
  const displayName = props.subreddit.url.replace('/','');
  const style = {
    backgroundImage: `url(${props.subreddit.icon_img})`
  };
  return (
    <div className='list-item' style={style}>
      {displayName}
    </div>
  );
};

class SubredditListView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subreddits: []
    };
  }

  render() {
    return (
      <div className="subreddit-list">
        {this.props.subreddits.map(subreddit => <ListItemView subreddit={subreddit} key={subreddit.url} />)}
      </div>
    );
  }

}

export default SubredditListView;

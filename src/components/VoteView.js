import React from 'react';
import { render } from 'react-dom';
import reddit from '../api/reddit';

class VoteView extends React.Component {
  constructor(props) {
    super(props);

    // get the vote direction
    let voteDir = 0;

    switch (this.props.item.get("likes")) {
      case null:
        voteDir = 0;
        break;
      case true:
        voteDir = 1;
        break;
      case false:
        voteDir = -1;
        break;
    }

    // set default
    this.state = {
      voteCount: this.props.item.get("score"),
      voteDirection: voteDir
    };
  }

  didUpvote() {
    // default to upvote
    let newVoteDir = this.state.voteDirection == -1 ? 0 : -1;
    let voteDelta = 1;

    switch (this.state.voteDirection) {
      case 1:
        newVoteDir = 0;
        voteDelta = -1;
        break;
      case -1:
        newVoteDir = 1;
        voteDelta = 2;
        break;
      case 0:
        newVoteDir = 1;
        voteDelta = 1;
        break;
    }

    // vote to reddit plz
    reddit.vote(newVoteDir, this.props.item.get("name"));

    this.setState({
      voteCount: this.state.voteCount + voteDelta,
      voteDirection: newVoteDir
    });
  }

  didDownvote() {
    // default to down
    let newVoteDir = this.state.voteDirection == -1 ? 0 : -1;
    let voteDelta = 1;

    switch (this.state.voteDirection) {
      case 1:
        newVoteDir = -1;
        voteDelta = -2;
        break;
      case -1:
        newVoteDir = 0;
        voteDelta = 1;
        break;
      case 0:
        newVoteDir = -1;
        voteDelta = -1;
        break;
    }

    // vote to reddit plz
    reddit.vote(newVoteDir, this.props.item.get("name"));

    this.setState({
      voteCount: this.state.voteCount + voteDelta,
      voteDirection: newVoteDir
    });
  }

  render() {
    let upvoteClass = "up vote";
    let downvoteClass = "down vote";
    switch (this.state.voteDirection) {
      case 1:
        upvoteClass += " selected";
        break;
      case -1:
        downvoteClass += " selected";
        break;
    }

    return (
      <div key={this.props.key} className="vote-view">
        <div className={upvoteClass} onClick={this.didUpvote.bind(this)}></div>
        <span className="vote-count">{this.state.voteCount}</span>
        <div className={downvoteClass} onClick={this.didDownvote.bind(this)}></div>
      </div>
    );
  }

}

export default VoteView;

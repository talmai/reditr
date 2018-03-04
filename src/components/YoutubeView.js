import React from 'react';
import { render } from 'react-dom';

class YoutubeView extends React.Component {

  constructor() {
    super();
    this.state = {
      isPlaying: false
    };
  }

  playPressed() {
    this.setState({ isPlaying: true });
  }

  componentDidUpdate() {
    // if we're in play mode then animate the player to be full screen
    if(this.state.isPlaying) {
      window.requestAnimationFrame(() => {
        setTimeout(() => this.refs['youtube-view-play-container'].classList.add('grow'), 100);
      });
    }
  }

  render() {

    // if we're in "playing mode" then return a placeholder thumbnail and a
    // container and embeded youtube iframe
    if(this.state.isPlaying) {
      var src = "http://www.youtube.com/embed/"
          + this.props.videoId
          + "?autoplay=1&origin=http://reditr.com";
      return (
        <div>
          <div className="youtube-view"/>
          <div className="youtube-view-play-container" ref="youtube-view-play-container">
            <iframe id="ytplayer" type="text/html" src={src} frameborder="0"/>
          </div>
        </div>
      );
    }

    // by default just return a thumbnail with a fake play button on top
    // and an invisible container with the hover button to preload
    // its image
    var style = { background: "url(http://img.youtube.com/vi/" + this.props.videoId + "/0.jpg)" };
    return (
      <div className="youtube-view" style={style}>
        <div className="youtube-view-play" onClick={this.playPressed.bind(this)}></div>
        <div className="youtube-view-red"></div>
      </div>
    );
  }

}

export default YoutubeView;

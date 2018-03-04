import React from 'react';
import { render } from 'react-dom';

import MediaParser from '../utilities/MediaParser';
import YoutubeView from './YoutubeView';
import GalleryView from './GalleryView';
import TweetView from './TweetView';

class MediaParserView extends React.Component {

  constructor(props) {
    super(props);

    // no media as default
    this.state = {
      media: {}
    };
  }

  /**
   Takes the url and determines what type of media we have
   */
  parseMedia() {
    // is this a self post?
    if (this.props.post.get('selftext_html')) {
      MediaParser.parseText(this.props.post.get('selftext_html'), media => {
        this.setState({
          media: media
        });
      });
    } else {
      MediaParser.parse(this.props.url, media => {
        this.setState({
          media: media
        });
      });
    }
  }

  componentDidMount() {
    // parse the url
    this.parseMedia();
  }

  render() {

    switch (this.state.media.type) {
    case "image": // simply return image tag
      return <img src={this.state.media.parsedUrl} className="media" />;
      break;
    case "youtube":
      return <YoutubeView videoId={this.state.media.videoId}/>;
      break;
    case "video":
      let sources = [];
      if (Array.isArray(this.state.media.parsedUrl)) {
        this.state.media.parsedUrl.forEach((media, index) => {
          sources.push(<source key={index} type={media.mime} src={media.url} />);
        });
      } else {
        sources = <source type="video/webm" src={this.state.media.parsedUrl} />;
      }

      return (
        <video className="media" autoPlay loop muted>
          {sources}
        </video>
      );
      break;
    case "gallery":
      return <GalleryView imageUrls={this.state.media.imageUrls} />;
      break;
    case "text":
    case "article":
      if (this.state.media.parsedText.length == 0) return false;
      return (
          <div className="media text" dangerouslySetInnerHTML={{__html: this.state.media.parsedText}}></div>
      );
      break;
    case "tweet":
      return <TweetView tweet={this.state.media.tweet}/>;
      break;
    default:
      return false;
      break;
    }


  }

}

export default MediaParserView;

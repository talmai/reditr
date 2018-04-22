import React from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'

import MediaParser from '../../utilities/MediaParser'
import YoutubeView from '../YoutubeView'
import GalleryView from '../GalleryView'
import TweetView from '../TweetView'

class MediaParserView extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
    post: PropTypes.object,
    style: PropTypes.object,
    onRender: PropTypes.func
  }

  static defaultProps = {
    onClick() {},
    onRender() {}
  }

  constructor(props) {
    super(props)

    // no media as default
    this.state = {
      media: {}
    }
  }

  /**
   Takes the url and determines what type of media we have
   */
  parseMedia() {
    // is this a self post?
    if (this.props.post.get('selftext_html')) {
      MediaParser.parseText(this.props.post.get('selftext_html'), media => {
        this.setState(
          {
            media: media
          },
          this.props.onRender
        )
      })
    } else {
      MediaParser.parse(this.props.url, media => {
        this.setState(
          {
            media: media
          },
          this.props.onRender
        )
      })
    }
  }

  componentDidMount() {
    // parse the url
    this.parseMedia()
  }

  componentWillReceiveProps(props) {
    this.parseMedia()
  }

  render() {
    const styles = {
      image: {
        cursor: 'zoom-in',
        ...this.props.style
      },
      article: {
        display: 'flex',
        alignItems: 'left',
        ...this.props.style
      },
      articleImage: {
        maxWidth: '250px'
      },
      articleText: {
        padding: '10px',
        boxSizing: 'border-box'
      }
    }

    switch (this.state.media.type) {
      case 'image': // simply return image tag
        return <img onClick={() => this.props.onClick(this.state.media.parsedUrl)} style={styles.image} src={this.state.media.parsedUrl} className="media" />
        break
      case 'supported-video':
        return <ReactPlayer className="media" url={this.state.media.url} />
        break
      case 'custom-video':
        let sources = []
        if (Array.isArray(this.state.media.parsedUrl)) {
          this.state.media.parsedUrl.forEach((media, index) => {
            sources.push(<source key={index} type={media.mime} src={media.url} />)
          })
        } else {
          sources = <source type="video/webm" src={this.state.media.parsedUrl} />
        }

        return (
          <video className="media" autoPlay loop muted>
            {sources}
          </video>
        )
        break
      case 'gallery':
        return <GalleryView imageUrls={this.state.media.imageUrls} />
        break
      case 'text':
        if (this.state.media.parsedText.length == 0) return false
        return (
          <div style={styles.article} className="media text">
            <p style={styles.articleText} dangerouslySetInnerHTML={{ __html: this.state.media.parsedText }} />
          </div>
        )
        break
      case 'article':
        if (this.state.media.parsedText.length == 0) return false
        return (
          <div style={styles.article} className="media text">
            <img style={styles.articleImage} src={this.state.media.parsedImage} />
            <p style={styles.articleText}>{this.state.media.parsedText}</p>
          </div>
        )
        break
      case 'tweet':
        return <TweetView tweet={this.state.media.tweet} />
        break
      default:
        return false
        break
    }
  }
}

export default MediaParserView

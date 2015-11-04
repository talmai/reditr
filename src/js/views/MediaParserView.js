import React from 'react'
import { render } from 'react-dom'

import MediaParser from '../api/MediaParser.js'

class MediaParserView extends React.Component {

    constructor(props) {
        super(props);

        // get the parser
        this.parser = new MediaParser();

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
            this.parser.parseText(this.props.post.get('selftext_html'), media => {
                this.setState({
                    media: media
                })
            })
        } else {
            this.parser.parse(this.props.url, media => {
                this.setState({
                    media: media
                })
            })
        }
    }

    componentDidMount() {
        // parse the url
        this.parseMedia()
    }

    render() {

        switch (this.state.media.type) {
            case "image": // simply return image tag
                return <img src={this.state.media.parsedUrl} className="media" />
                break
            case "video":
                return (
                    <video className="media" autoPlay loop muted>
                        <source type="video/webm" src={this.state.media.parsedUrl} />
                    </video>
                )
                break
            case "text":
                return (
                    <div className="media text" dangerouslySetInnerHTML={{__html: this.state.media.parsedText}}></div>
                )
                break;
            default:
                return false
                break
        }


    }

}

export default MediaParserView

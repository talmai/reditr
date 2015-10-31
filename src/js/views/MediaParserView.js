import React from 'react'
import { render } from 'react-dom'

import MediaParser from '../api/MediaParser.js'

class MediaParserView extends React.Component {

    constructor(props) {
        super(props)

        // get the parser
        this.parser = new MediaParser()

        // no media as default
        this.state = {
            media: {}
        }
    }
//
    /**
      Takes the url and determines what type of media we have
    */
    parseMedia() {
        this.parser.parse(this.props.url, media => {
            this.setState({
                media: media
            })
        })
    }

    componentDidMount() {
        // parse the url
        this.parseMedia()
    }

    render() {

        switch (this.state.media.type) {
            case "image": // simply return image tag
                return <img src={this.state.media.parsedUrl} className="stream-item-media" />
                break
            case "video":
                return (
                    <video className="stream-item-media" autoPlay loop muted>
                        <source type="video/webm" src={this.state.media.parsedUrl} />
                    </video>
                )
                break
            default:
                return false
                break
        }


    }

}

export default MediaParserView

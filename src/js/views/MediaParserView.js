import React from 'react'
import { render } from 'react-dom'

import MediaParser from '../api/MediaParser.js'

class MediaParserView extends React.Component {

    constructor(props) {
        super(props)

        this.parser = new MediaParser()

        this.state = {
            media: {}
        }
    }

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
            default:
                return false
                break
        }


    }

}

export default MediaParserView

import React from 'react';
import { render } from 'react-dom';

class YoutubeView extends React.Component {

    render() {
        var thumb = "http://img.youtube.com/vi/" + this.props.videoId + "/0.jpg";
        return (
            <div className="youtube-view">
                <img className="logo" src={thumb} />
            </div>
        );
    }

}

export default YoutubeView;

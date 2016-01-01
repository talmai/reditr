import React from 'react';
import moment from 'moment';

class TweetView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    clickName() {
        window.open('http://twitter.com/' + this.props.tweet.username);
    }

    playVideo() {
        this.setState({ playVideo: true });
    }

    componentDidUpdate() {
        if (this.state.playVideo) {
            var video = this.refs["video"];
            video.onended = video.onpause = e => {
                this.setState({ playVideo: false });
            };
        }
    }

    render() {
        var tweet = this.props.tweet;
        var profileImageStyle = { backgroundImage: 'url(' + tweet.avatar + ')' };
        var formattedTime = moment(tweet.datetime).format('h:mm A - D MMM YYYY');
        var image = false;
        if (tweet.image) {
            image = <div className="image" style={{backgroundImage: 'url(' + tweet.image + ')'}} />;
        }
        if (tweet.videoThumb && tweet.video) {
            image = <div className="image" style={{backgroundImage: 'url(' + tweet.videoThumb + ')'}}>
                        <div className="play-button" onClick={this.playVideo.bind(this)}/>
                    </div>;
        }

        var video = false;
        if (this.state.playVideo) {
            video = <div className="videoContainer">
                        <video ref="video" className="video" autoPlay loop controls>
                            <source type="video/mp4" src={tweet.video} />
                        </video>
                    </div>;
        }
        var clickName = this.clickName.bind(this);
        return (
                <div className="tweet-view">
                {image}
                {video}
                <div className="tweet-container">
                    <div className="user-info">
                        <div className="profile-image" style={profileImageStyle} />
                        <div className="name" dangerouslySetInnerHTML={{__html: tweet.name}} onClick={clickName}/>
                        <div className="username" dangerouslySetInnerHTML={{__html: '@'+tweet.username}} />
                    </div>
                    <div style={{clear:'both'}} />
                    <div className="text" dangerouslySetInnerHTML={{__html: tweet.text}} />
                    <div className="date" dangerouslySetInnerHTML={{__html: formattedTime}} />
                    <div className="controls">
                    <div className="replyContainer container" onClick={clickName}>
                        <div className="reply icon"/>
                    </div>
                    <div className="retweetContainer container" onClick={clickName}>
                        <div className="retweet icon"/>
                        <span dangerouslySetInnerHTML={{__html: tweet.retweets}} />
                    </div>
                    <div className="heartContainer container" onClick={clickName}>
                        <div className="heart icon"/>
                        <span dangerouslySetInnerHTML={{__html: tweet.hearts}} />
                    </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default TweetView;

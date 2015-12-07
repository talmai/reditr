import React from 'react';

class GalleryView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentIndex: 0
        }
    }

    onNext(e) {
        let currentIndex = this.state.currentIndex;
        currentIndex++;
        if (currentIndex != this.props.imageUrls.length) {
            this.setState({
                currentIndex: currentIndex
            });
        }
    }

    onPrev(e) {
        let currentIndex = this.state.currentIndex;
        currentIndex--;
        if (currentIndex > -1) {
            this.setState({
                currentIndex: currentIndex
            });
        }
    }

    render() {
        return (
            <div className="gallery-view">
                <div onClick={this.onPrev.bind(this)} className="prev"></div>
                <img className="media" src={this.props.imageUrls[this.state.currentIndex]} />
                <div onClick={this.onNext.bind(this)} className="next"></div>
                <div className="details">{this.state.currentIndex + 1}/{this.props.imageUrls.length}</div>
            </div>
        );
    }

}

export default GalleryView;

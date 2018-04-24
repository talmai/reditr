import React from 'react'
import PropTypes from 'prop-types'

import style from '../../utilities/Style'
import MediaParserView from '../MediaParserView'

class HoverView extends React.Component {
  static propTypes = {
    post: PropTypes.object,
    anchor: PropTypes.object
  }

  static style() {
    return {
      container: {
        position: 'fixed',
        maxWidth: '50%',
        maxHeight: '80%',
        backgroundColor: 'white',
        border: '1px solid #eee',
        borderRadius: '3px',
        overflow: 'hidden'
      },
      media: { maxHeight: '100%', maxWidth: '100%' }
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      containerPosition: {
        top: '-200%',
        left: '-200%'
      }
    }
  }

  onLoaded = () => {
    this.mediaContainer && this.createContainerPosition()
  }

  createContainerPosition = () => {
    if (!this.props.anchor) return

    const anchorRect = this.props.anchor.getBoundingClientRect()
    const containerRect = this.mediaContainer.getBoundingClientRect()
    const windowRect = { top: 0, left: 0, width: window.outerWidth, height: window.outerHeight }

    this.setState({
      containerPosition: this.createLeftPosition(anchorRect, containerRect, windowRect) || this.createRightPosition(anchorRect, containerRect, windowRect)
    })
  }

  // returns false if it's outside the window
  createLeftPosition = (anchorRect, containerRect, inRect) => {
    const left = anchorRect.left - containerRect.width
    let top = anchorRect.top - (containerRect.height - anchorRect.height) / 2

    if (top < 0) top = 0
    if (top + containerRect.height > inRect.height) top = inRect.height - containerRect.height
    if (left < 0) return false

    return { top, left }
  }

  // returns false if it's outside the window
  createRightPosition = (anchorRect, containerRect, inRect) => {
    const left = anchorRect.left + anchorRect.width
    let top = anchorRect.top - (containerRect.height - anchorRect.height) / 2

    if (top < 0) top = 0
    if (top + containerRect.height > inRect.height) top = inRect.height - containerRect.height
    if (left > inRect.width) return false

    return { top, left }
  }

  render() {
    if (!this.props.post) return false

    return (
      <div
        ref={m => (this.mediaContainer = m)}
        className={this.props.classes.container}
        style={{
          top: this.state.containerPosition.top,
          left: this.state.containerPosition.left
        }}>
        <MediaParserView className={this.props.classes.media} onRender={this.onLoaded} url={this.props.post.get('url')} post={this.props.post} />
      </div>
    )
  }
}

export default style(HoverView)

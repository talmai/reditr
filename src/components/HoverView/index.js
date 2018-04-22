import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'

import MediaParserView from '../MediaParserView'

class HoverView extends React.Component {
  static propTypes = {
    post: PropTypes.object,
    anchor: PropTypes.object
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

  componentWillReceiveProps(props) {
    this.setState({
      containerPosition: {
        top: '-200%',
        left: '-200%'
      }
    })
  }

  onLoaded = () => {
    this.mediaContainer && debounce(this.createContainerPosition, 250)()
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
    let top = anchorRect.top - ((containerRect.height - anchorRect.height) / 2)

    if (top < 0) top = 0
    if (top + containerRect.height > inRect.height) top = inRect.height - containerRect.height
    if (left < 0) return false

    return { top, left }
  }

  // returns false if it's outside the window
  createRightPosition = (anchorRect, containerRect, inRect) => {
    const left = anchorRect.left + anchorRect.width
    let top = anchorRect.top - ((containerRect.height - anchorRect.height) / 2)

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
        style={{
          position: 'absolute',
          top: this.state.containerPosition.top,
          left: this.state.containerPosition.left,
          maxWidth: '50%',
          maxHeight: '80%',
          backgroundColor: 'white',
          border: '1px solid #eee',
          borderRadius: '3px'
        }}>
        <MediaParserView onRender={this.onLoaded} style={{ maxHeight: '100%', maxWidth: '100%' }} url={this.props.post.get('url')} post={this.props.post} />
      </div>
    )
  }
}

export default HoverView

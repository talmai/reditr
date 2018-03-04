import React from 'react'

import Observable from '../../utilities/Observable'

class Link extends React.Component {
  constructor(props) {
    super(props)
  }

  handleClick(e) {
    var href = this.props.to
    var text = this.props.text || href
    e.preventDefault()
    e.stopPropagation()
    if (this.props.onClick) {
      this.props.onClick()
    } else {
      Observable.global.trigger('pushNav', { href, text })
    }
    return false
  }

  render() {
    var href = this.props.to
    var className = this.props.className || false
    return (
      <a
        className={className}
        href={href}
        onClick={this.handleClick.bind(this)}>
        <span>{this.props.children}</span>
      </a>
    )
  }
}

export default Link

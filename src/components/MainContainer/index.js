import React from 'react'

export default class MainContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      viewMode: this.props.viewMode
    }
  }

  render() {
    const styles = {
      container: {
        position: 'relative',
        height: 'calc(100% - 46px)',
        width: 'calc(100% - 231px)',
        left: '231px',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }
    }
    return (
      <div style={styles.container}>{React.Children.map(this.props.children, (child, i) => React.cloneElement(child, { viewMode: this.state.viewMode }))}</div>
    )
  }
}

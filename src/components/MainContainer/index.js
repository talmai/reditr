import React from 'react'

export default class MainContainer extends React.Component {

  render() {
    const styles = {
      container: {
        position: 'relative',
        height: 'calc(100% - 46px)',
        width: 'calc(100% - 285px)',
        left: '285px',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }
    }
    return <div style={styles.container}>{this.props.children}</div>
  }

}
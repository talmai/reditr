import React from 'react'

import DataStore from '../../utilities/DataStore'

class BaseView extends React.Component {
  constructor(props) {
    super(props)

    this.enableCache = false
    this.cacheName = 'base_view'
  }
}

export default BaseView

import React from 'react'
import { render } from 'react-dom'

import CreateNotificationView from './CreateNotificationView.js'

class AdminView extends React.Component {

    render() {
        return (
          <div className="AdminView">
            <CreateNotificationView />
          </div>
        )
    }
}

export default AdminView

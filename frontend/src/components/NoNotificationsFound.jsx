import React from 'react'
import { BellIcon } from 'lucide-react'
import './NoNotificationsFound.css'

function NoNotificationsFound() {
  return (
    <div className="no-notification-wrapper">
      <div className="no-notification-icon">
        <BellIcon className="bell-icon"/>
      </div>
      <h3 className="no-notification-title">No Notifications yet</h3>
      <p className="no-notification-text">
        When you receive friend requests or messages, they'll appear here. 
      </p>
    </div>
  )
}

export default NoNotificationsFound

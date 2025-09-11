import React from 'react'
import { LoaderIcon } from 'lucide-react'
import "./ChatLoader.css"; // Import CSS file

const ChatLoader = () => {
  return (
    <div className="chat-loader">
      <LoaderIcon className="loader-icon" />
      <p className="loader-text">Connecting to chat.....</p>
    </div>
  )
}

export default ChatLoader

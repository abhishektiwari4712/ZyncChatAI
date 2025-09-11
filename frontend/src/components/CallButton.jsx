import { VideoIcon } from "lucide-react";
import "./CallButton.css"; // Import CSS file

function CallButton({ handleVideoCall }) {
  return (
    <div className="call-button-container">
      <button 
        onClick={handleVideoCall} 
        className="call-btn"
        aria-label="Start video call"
      >
        <VideoIcon className="video-icon" />
      </button>
    </div>
  );
}

export default CallButton;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import useAuthUser from "../../hooks/useAuthUser";
import { getStreamToken } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import ChatLoader from "../../components/ChatLoader";
import { StreamChat } from "stream-chat";
import { toast } from "react-toastify";
import CallButton from "../../components/CallButton";
import Chatbot from "../../components/Chatbot.jsx";
import "./ChatPage.css";
import TranslationButton from "../../components/TranslateButton.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const { authUser } = useAuthUser();
  const [showTranslate, setShowTranslate] = useState(false);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currentChannel.watch();
        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.error("Error initializing chat", error);
        toast.error("Could not connect to chat. Please try again.");
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  if (Loading || !chatClient || !channel) return <ChatLoader />;

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video Call Sent successfully...");
    }
  };

  // Custom ChannelHeader with call + AI button
  const CustomChannelHeader = () => (
    <div className="chat-header">
      <ChannelHeader />
      <div className="header-buttons">
        <CallButton handleVideoCall={handleVideoCall} />
        <button
          className="chatbot-toggle-btn"
          onClick={() => setShowChatbot((prev) => !prev)}
        >
          {showChatbot ? "Close AI" : "Chat with AI"}
        </button>
        
        <button
          className="chatbot-toggle-btn"
          style={{ backgroundColor: "#4cafef" }}
          onClick={() => setShowTranslate((prev) => !prev)}
        >
          {showTranslate ? "Close Translate" : "Translate"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="chat-page">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="chat-container">
            <Window>
              <CustomChannelHeader />
              <div className="chat-messages-container">
                <MessageList />
              </div>
              <div className="chat-input-container">
                <MessageInput focus />
              </div>
            </Window>

            {/* AI Chatbot Overlay */}
            {showChatbot && (
              <div className="chatbot-wrapper">
                <Chatbot />
              </div>
            )}
             
            {showTranslate && (
              <div className="translate-section">
                <TranslationButton />
              </div>
            )}

            <div>

            </div>
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;


// // import React, { useState, useEffect } from 'react'
// // import { useParams } from 'react-router'
// // import useAuthUser from '../../hooks/useAuthUser';
// // import { getStreamToken } from '../../lib/api';
// // import { useQuery } from '@tanstack/react-query';
// // import {
// //   Channel,
// //   ChannelHeader,
// //   Chat,
// //   MessageInput,
// //   MessageList,
// //   Thread,
// //   Window,
// // } from "stream-chat-react";
// // import ChatLoader from '../../components/ChatLoader';
// // import { StreamChat } from 'stream-chat';
// // import { toast } from 'react-toastify';
// // import CallButton from '../../components/CallButton';
// // import Chatbot from '../../components/Chatbot.jsx'; // path sahi check karo

// // import "./ChatPage.css"; // <-- Import CSS

// // const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// // const ChatPage = () => {
// //   const { id: targetUserId } = useParams();
// //   const [chatClient, setChatClient] = useState(null);
// //   const [channel, setChannel] = useState(null);
// //   const [Loading, setLoading] = useState(true);
// //   const { authUser } = useAuthUser();

// //   const { data: tokenData } = useQuery({
// //     queryKey: ["streamToken"],
// //     queryFn: getStreamToken,
// //     enabled: !!authUser // run only when user exists
// //   });

// //   useEffect(() => {
// //     const initChat = async () => {
// //       if (!tokenData?.token || !authUser) return;
// //       try {
// //         console.log("Initializing stream chat client...");

// //         const client = StreamChat.getInstance(STREAM_API_KEY);

// //         await client.connectUser(
// //           {
// //             id: authUser._id,
// //             name: authUser.fullName,
// //             image: authUser.profilePic,
// //           },
// //           tokenData.token
// //         );

// //         const channelId = [authUser._id, targetUserId].sort().join("-");

// //         const currentChannel = client.channel("messaging", channelId, {
// //           members: [authUser._id, targetUserId],
// //         });

// //         await currentChannel.watch();
// //         setChatClient(client);
// //         setChannel(currentChannel);
// //       } catch (error) {
// //         console.error("Error initializing chat", error);
// //         toast.error("Could not connect to chat. Please try again.");
// //         window.location.href = "/";
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     initChat();
// //   }, [tokenData, authUser, targetUserId]);

// //   if (Loading || !chatClient || !channel) return <ChatLoader />;

// //   const handleVideoCall = () => {
// //     if (channel) {
// //       const callUrl = `${window.location.origin}/call/${channel.id}`;
// //       channel.sendMessage({
// //         text: `I've started a video call. Join me here: ${callUrl}`,
// //       });
// //       toast.success("Video Call Sent successfully...");
// //     }
// //   };

// //   // Custom ChannelHeader component with call button
// //   const CustomChannelHeader = () => (
// //     <div className="chat-header">
// //       <ChannelHeader />
// //       <CallButton handleVideoCall={handleVideoCall} />
// //     </div>
// //   );

// //   return (
// //     <div className="chat-page">
// //       <Chat client={chatClient}>
// //         <Channel channel={channel}>
// //           <div className="chat-container">
// //             <Window>
// //               <CustomChannelHeader />
// //               <div className="chat-messages-container">
// //                 <MessageList />
// //               </div>
// //               <div className="chat-input-container">
// //                 <MessageInput focus />
// //               </div>
// //             </Window>
// //             {/* ===== AI Chatbot Overlay Section ===== */}
// //             <div className="chatbot-container">
// //               <Chatbot />
// //             </div>
// //           </div>
// //         </Channel>
// //       </Chat>
// //     </div>
// //   );
// // };

// // export default ChatPage;

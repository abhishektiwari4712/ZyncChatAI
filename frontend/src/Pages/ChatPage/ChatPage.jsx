import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import useAuthUser from '../../hooks/useAuthUser';
import { getStreamToken, aiChatbot, aiSmartReply, aiToxicCheck, aiSeoOptimize } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import ChatLoader from '../../components/ChatLoader';
import { StreamChat } from 'stream-chat';
import { toast } from 'react-toastify';
import CallButton from '../../components/CallButton';
import "./ChatPage.css"; // <-- Import CSS

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser // run only when user exists
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        console.log("Initializing stream chat client...");

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
        setConnectionError(true);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  if (Loading) return <ChatLoader />;
  if (connectionError) {
    return (
      <div className="chat-error">
        <h2>Could not connect to chat</h2>
        <p>Please try again later or contact support if the problem persists.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  if (!chatClient || !channel) return <ChatLoader />;

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video Call Sent successfully...");
    }
  };

  // Custom ChannelHeader component with call button and AI tools
  const CustomChannelHeader = () => (
    <div className="chat-header">
      <ChannelHeader />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={async () => {
          try {
            const lastMsg = await channel?.state?.messages?.slice(-1)?.[0]?.text || '';
            const { content } = await aiChatbot(lastMsg || 'Hello');
            if (content) {
              await channel.sendMessage({ text: content });
            }
          } catch (e) {
            toast.error('AI assistant failed');
          }
        }} className="btn-ai" title="Ask AI">Ask AI</button>
        <button onClick={async () => {
          try {
            const lastMsg = await channel?.state?.messages?.slice(-1)?.[0]?.text || '';
            const { suggestions: sugs } = await aiSmartReply(lastMsg || '');
            setSuggestions(Array.isArray(sugs) ? sugs : []);
          } catch (e) {
            toast.error('Failed to fetch smart replies');
          }
        }} className="btn-ai" title="Smart Replies">Smart Replies</button>
        <button onClick={async () => {
          try {
            const lastMsg = await channel?.state?.messages?.slice(-1)?.[0]?.text || '';
            const { optimized } = await aiSeoOptimize(lastMsg || '');
            if (optimized) {
              await channel.sendMessage({ text: optimized });
            }
          } catch (e) {
            toast.error('SEO optimize failed');
          }
        }} className="btn-ai" title="SEO Optimize">SEO Optimize</button>
        <CallButton handleVideoCall={handleVideoCall} />
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
                <MessageInput
                  focus
                  overrideSubmitHandler={async (message) => {
                    try {
                      const text = message?.text || '';
                      const { score } = await aiToxicCheck(text);
                      if (score > 0.7) {
                        toast.warning('⚠️ Message contains toxic content. Please edit before sending.');
                        return;
                      }
                      await channel.sendMessage({ text });
                    } catch (e) {
                      toast.error('Failed to send message');
                    }
                  }}
                />
                {suggestions?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {suggestions.slice(0,3).map((sug, idx) => (
                      <button
                        key={idx}
                        className="btn-suggestion"
                        onClick={() => {
                          // Insert into MessageInput by sending immediately
                          channel.sendMessage({ text: sug });
                        }}
                      >{sug}</button>
                    ))}
                  </div>
                )}
              </div>
            </Window>
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;

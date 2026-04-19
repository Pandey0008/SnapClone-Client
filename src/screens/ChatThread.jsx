import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { API_BASE_URL } from '../config/api';
import { appendMessage, setTyping, setMessagesByRoom } from '../redux/slices/chatSlice';
import { useSocket, joinRoom, getSocket } from '../redux/socketHook';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInput from '../components/chat/ChatInput';
import Avatar from '../components/common/Avatar';

const ChatThread = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef(null);

  const { messages, conversations, typingUsers } = useAppSelector((state) => state.chat);
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const { onlineUsers } = useAppSelector((state) => state.online);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Initialize Socket.IO
  useSocket(user);

  // Find peer from conversations
  const conversation = conversations.find(c => c.roomId === roomId);
  const peer = conversation?.peer;

  // Check if peer is online
  const isOnline = peer && onlineUsers.includes(peer._id);

  const currentMessages = messages[roomId] || [];
  const isTyping = typingUsers[roomId]?.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages and join room when roomId changes
  useEffect(() => {
    if (!accessToken || !roomId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${roomId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setMessagesByRoom({
            roomId,
            messages: data.messages || []
          }));
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Join room via Socket.IO
    joinRoom(roomId);
  }, [roomId, accessToken, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSend = async (text) => {
    if (!roomId || !text.trim()) return;

    try {
      setSending(true);
      const socket = getSocket();

      if (socket) {
        // Send via Socket.IO for real-time
        socket.emit('send-message', {
          roomId,
          text: text.trim(),
          mediaUrl: null
        });
      } else {
        // Fallback to API if socket not available
        const response = await fetch('${API_BASE_URL}/api/v1/chat/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            roomId,
            text: text.trim(),
            mediaUrl: null
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAttach = () => {
    alert("Snap attachment coming soon (opens Camera)");
    // navigate('/camera') later
  };

  return (
    <div className="min-h-screen bg-snap-dark flex flex-col">
      {/* Header */}
      <div className="bg-snap-darkMid border-b border-white/10 px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-2xl">←</button>
        {peer ? (
          <>
            <Avatar uri={peer.avatarUrl} name={peer.displayName} size={42} />
            <div>
              <h2 className="font-semibold">{peer.displayName}</h2>
              <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-snap-white50'}`}>
                {isOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="text-snap-white50">Loading...</div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-snap-white50">Loading messages...</p>
          </div>
        ) : (
          <>
            {currentMessages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isSelf={msg.senderId === user._id || msg.senderId._id === user._id}
              />
            ))}
            <TypingIndicator visible={isTyping} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} onAttach={handleAttach} disabled={sending || !peer} />
    </div>
  );
};

export default ChatThread;
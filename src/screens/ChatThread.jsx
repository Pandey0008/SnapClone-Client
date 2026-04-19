import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { API_BASE_URL } from '../config/api';
import { appendMessage, setTyping, setMessagesByRoom } from '../redux/slices/chatSlice';
import { useSocket, joinRoom, getSocket } from '../redux/socketHook';
import { startCall } from '../redux/slices/callSlice';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInput from '../components/chat/ChatInput';
import Avatar from '../components/common/Avatar';
import { Phone, Video } from 'lucide-react';

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
  const [callPending, setCallPending] = useState(false); // waiting for other person to accept

  useSocket(user);

  const conversation = conversations.find(c => c.roomId === roomId);
  const peer = conversation?.peer;
  const isOnline = peer && onlineUsers.includes(peer._id);
  const currentMessages = messages[roomId] || [];
  const isTyping = typingUsers[roomId]?.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen for call-accepted / call-rejected from remote peer
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onCallAccepted = ({ acceptedBy }) => {
      console.log('Call accepted by', acceptedBy);
      setCallPending(false);
      // Navigate to call screen as the CALLER (no incomingCall in redux, peer is set)
      navigate('/call/active', { replace: true });
    };

    const onCallRejected = ({ rejectedBy }) => {
      console.log('Call rejected by', rejectedBy);
      setCallPending(false);
      alert('Call was declined.');
    };

    socket.on('call-accepted', onCallAccepted);
    socket.on('call-rejected', onCallRejected);

    return () => {
      socket.off('call-accepted', onCallAccepted);
      socket.off('call-rejected', onCallRejected);
    };
  }, [navigate]);

  const initiateVideoCall = () => {
    if (!peer) return;
    // Store peer info in Redux so ActiveCall knows who the remote is
    dispatch(startCall({ peer: { displayName: peer.displayName, avatarUrl: peer.avatarUrl, _id: peer._id } }));
    getSocket()?.emit('video-call-initiate', {
      to: peer._id,
      from: user._id,
      fromName: user.displayName,
      fromAvatar: user.avatarUrl
    });
    setCallPending(true);
  };

  const initiateVoiceCall = () => {
    if (!peer) return;
    dispatch(startCall({ peer: { displayName: peer.displayName, avatarUrl: peer.avatarUrl, _id: peer._id } }));
    getSocket()?.emit('voice-call-initiate', {
      to: peer._id,
      from: user._id,
      fromName: user.displayName,
      fromAvatar: user.avatarUrl
    });
    setCallPending(true);
  };

  useEffect(() => {
    if (!accessToken || !roomId) return;
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${roomId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          dispatch(setMessagesByRoom({ roomId, messages: data.messages || [] }));
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
    joinRoom(roomId);
  }, [roomId, accessToken, dispatch]);

  useEffect(() => { scrollToBottom(); }, [currentMessages]);

  const handleSend = async (text, mediaUrl) => {
    if (!roomId || (!text?.trim() && !mediaUrl)) return;
    try {
      setSending(true);
      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', { roomId, text: text?.trim() || '', mediaUrl: mediaUrl || null });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAttach = () => {
    alert("Snap attachment coming soon (opens Camera)");
  };

  return (
    <div className="min-h-screen bg-snap-dark flex flex-col">
      {/* Header */}
      <div className="bg-snap-darkMid border-b border-white/10 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
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

        {/* Call Buttons */}
        <div className="flex items-center gap-3">
          {callPending && (
            <span className="text-xs text-snap-yellow animate-pulse mr-2">Calling...</span>
          )}
          <button
            onClick={initiateVoiceCall}
            disabled={!isOnline || !peer || callPending}
            className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Voice call"
          >
            <Phone size={20} className="text-snap-yellow" />
          </button>
          <button
            onClick={initiateVideoCall}
            disabled={!isOnline || !peer || callPending}
            className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Video call"
          >
            <Video size={20} className="text-snap-yellow" />
          </button>
        </div>
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
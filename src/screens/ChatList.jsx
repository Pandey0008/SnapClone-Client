import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { API_BASE_URL } from '../config/api';
import { setConversations } from '../redux/slices/chatSlice';
import { setSnapInbox } from '../redux/slices/snapSlice';
import ConversationRow from '../components/chat/ConversationRow';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Flame } from 'lucide-react';

const ChatList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversations } = useAppSelector((state) => state.chat);
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const { inbox: snapInbox } = useAppSelector((state) => state.snap);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load conversations
  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        dispatch(setConversations(data.conversations));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [accessToken, dispatch]);

  // Load snap inbox from server (for snaps received while offline)
  useEffect(() => {
    if (!accessToken) return;

    const fetchSnapInbox = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/snaps/inbox`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.snaps || []).map(s => ({
            snapId: s._id,
            senderId: s.sender?._id,
            senderName: s.sender?.displayName,
            senderAvatar: s.sender?.avatarUrl,
            mediaType: s.mediaType,
            caption: s.caption,
          }));
          dispatch(setSnapInbox(mapped));
        }
      } catch (err) {
        console.error('Failed to load snap inbox:', err);
      }
    };

    fetchSnapInbox();
  }, [accessToken, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-snap-dark flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-snap-dark pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-snap-dark border-b border-white/10 z-10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chats</h1>
        <Avatar uri={user?.avatarUrl} name={user?.displayName || 'You'} size={42} />
      </div>

      {/* ── Snap Inbox ── */}
      {snapInbox.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs text-snap-white50 uppercase tracking-widest mb-3 font-semibold">
            Snaps 👻
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {snapInbox.map((snap) => (
              <div
                key={snap.snapId}
                onClick={() => navigate(`/snap/view/${snap.snapId}`)}
                className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
              >
                {/* Ring around avatar = unviewed snap */}
                <div className="p-0.5 rounded-full bg-gradient-to-br from-snap-yellow to-orange-400">
                  <div className="p-0.5 rounded-full bg-snap-dark">
                    <Avatar
                      uri={snap.senderAvatar}
                      name={snap.senderName || '?'}
                      size={56}
                    />
                  </div>
                </div>
                <p className="text-xs text-center text-white w-16 truncate">
                  {snap.senderName?.split(' ')[0] || 'Snap'}
                </p>
                {/* Media type badge */}
                <span className="text-xs bg-snap-yellow text-white px-2 py-0.5 rounded-full font-bold -mt-1">
                  {snap.mediaType === 'video' ? '🎥' : '📸'}
                </span>
              </div>
            ))}
          </div>
          <div className="border-b border-white/10 mt-3" />
        </div>
      )}

      {/* ── Conversations ── */}
      {error ? (
        <EmptyState icon="⚠️" title="Error loading chats" subtitle={error} />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No chats yet"
          subtitle="Send your first snap to start a conversation"
          onAction={() => navigate('/camera')}
          actionLabel="Open Camera"
        />
      ) : (
        <div className="divide-y divide-white/10">
          {conversations.map((conv) => (
            <ConversationRow
              key={conv.roomId}
              conversation={conv}
              onPress={() => navigate(`/chat/${conv.roomId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
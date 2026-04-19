import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setConversations } from '../redux/slices/chatSlice';
import ConversationRow from '../components/chat/ConversationRow';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChatList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversations } = useAppSelector((state) => state.chat);
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:3000/api/v1/chat/conversations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        dispatch(setConversations(data.conversations));
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [accessToken, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-snap-dark flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-snap-dark">
        <div className="sticky top-0 bg-snap-dark border-b border-white/10 z-10 px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chats</h1>
          <Avatar uri={user?.avatarUrl} name={user?.displayName || 'You'} size={42} />
        </div>
        <EmptyState
          icon="⚠️"
          title="Error loading chats"
          subtitle={error}
          onAction={() => window.location.reload()}
          actionLabel="Retry"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-snap-dark">
      {/* Header */}
      <div className="sticky top-0 bg-snap-dark border-b border-white/10 z-10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chats</h1>
        <Avatar uri={user?.avatarUrl} name={user?.displayName || 'You'} size={42} />
      </div>

      {conversations.length === 0 ? (
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
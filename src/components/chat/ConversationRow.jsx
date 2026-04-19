import { memo } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const ConversationRow = memo(({ conversation, onPress }) => {
  const { peer, lastMessage, unreadCount, lastMessageAt } = conversation;

  const time = lastMessageAt
    ? new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(lastMessageAt))
    : '';

  const messageText = lastMessage?.text ? 
    lastMessage.text : 
    (lastMessage?.mediaUrl ? 'Sent a snap' : 'No messages yet');

  return (
    <div
      onClick={onPress}
      className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/10 cursor-pointer"
    >
      <Avatar uri={peer?.avatarUrl} name={peer?.displayName || 'User'} size={56} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-semibold text-lg truncate">{peer?.displayName}</h3>
          <span className="text-xs text-snap-white50">{time}</span>
        </div>

        <p className="text-sm text-snap-white50 truncate mt-0.5">
          {messageText}
        </p>
      </div>

      {unreadCount > 0 && <Badge count={unreadCount} />}
    </div>
  );
});

export default ConversationRow;
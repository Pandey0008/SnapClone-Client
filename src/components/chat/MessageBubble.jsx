import { memo } from 'react';

const MessageBubble = memo(({ message, isSelf }) => {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-3xl text-[17px] leading-relaxed ${
          isSelf
            ? 'bg-snap-yellow text-black rounded-br-none'
            : 'bg-snap-darkMid text-white rounded-bl-none'
        }`}
      >
        {message.text && <p>{message.text}</p>}
        
        {message.mediaUrl && (
          <img
            src={message.mediaUrl}
            alt="media"
            className="rounded-2xl max-h-[280px] mt-1"
          />
        )}

        {isSelf && message.readAt && (
          <div className="text-[10px] text-right mt-1 opacity-70">✓✓</div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
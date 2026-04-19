import { memo } from 'react';
import { FileText, Music, Play } from 'lucide-react';

const MessageBubble = memo(({ message, isSelf }) => {
  const getMediaType = (url) => {
    if (!url) return null;
    const urlLower = url.toLowerCase();
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
    if (urlLower.match(/\.(mp4|mov|webm|avi)$/i)) return 'video';
    if (urlLower.match(/\.(pdf)$/i)) return 'pdf';
    if (urlLower.includes('video')) return 'video';
    if (urlLower.includes('image')) return 'image';
    return 'file';
  };

  const mediaType = getMediaType(message.mediaUrl);

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
        
        {message.mediaUrl && mediaType === 'image' && (
          <img
            src={message.mediaUrl}
            alt="media"
            className="rounded-2xl max-h-[280px] mt-1 max-w-full"
          />
        )}

        {message.mediaUrl && mediaType === 'video' && (
          <video
            src={message.mediaUrl}
            controls
            className="rounded-2xl max-h-[280px] mt-1 max-w-full"
          />
        )}

        {message.mediaUrl && (mediaType === 'pdf' || mediaType === 'file') && (
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-1 p-2 bg-black/20 rounded-lg hover:bg-black/40 transition"
          >
            <FileText size={20} />
            <span className="truncate text-sm underline">View File</span>
          </a>
        )}

        {isSelf && message.readAt && (
          <div className="text-[10px] text-right mt-1 opacity-70">✓✓</div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
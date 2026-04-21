import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Flame, Eye } from 'lucide-react';

const MessageBubble = memo(({ message, isSelf }) => {
  const navigate = useNavigate();

  // ── Snap bubble ──
  if (message.messageType === 'snap') {
    const viewed = message.snapViewed;

    return (
      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-3`}>
        <div
          onClick={() => {
            if (!isSelf && !viewed) {
              navigate(`/snap/view/${message.snapId}`);
            }
          }}
          className={`flex items-center gap-3 px-4 py-3 rounded-3xl cursor-pointer transition-all
            ${isSelf
              ? viewed
                ? 'bg-white/10 border border-white/20'           // sent + viewed
                : 'bg-snap-yellow/20 border border-snap-yellow'  // sent + not viewed
              : viewed
                ? 'bg-white/10 border border-white/20 cursor-default opacity-60' // received + viewed
                : 'bg-snap-yellow/30 border-2 border-snap-yellow animate-pulse'  // received + unviewed (pulsing)
            }`}
        >
          {/* Flame icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${viewed ? 'bg-white/10' : 'bg-snap-yellow'}`}
          >
            {viewed
              ? <Eye size={18} className="text-white/50" />
              : <Flame size={18} className={isSelf ? 'text-snap-yellow' : 'text-white'} />
            }
          </div>

          <div>
            <p className={`font-semibold text-sm ${viewed ? 'text-white/50' : 'text-white'}`}>
              {isSelf
                ? viewed ? 'Snap Opened' : 'Snap Sent'
                : viewed ? 'Snap Viewed' : 'Tap to Open Snap 👻'
              }
            </p>
            {message.text && (
              <p className="text-xs text-white/60 mt-0.5 truncate max-w-[160px]">{message.text}</p>
            )}
            {!viewed && !isSelf && (
              <p className="text-xs text-snap-yellow font-medium mt-0.5">Disappears after viewing</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Regular message bubble ──
  const getMediaType = (url) => {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.match(/\.(jpg|jpeg|png|gif|webp)$/i) || u.includes('image')) return 'image';
    if (u.match(/\.(mp4|mov|webm|avi)$/i) || u.includes('video')) return 'video';
    if (u.match(/\.(pdf)$/i)) return 'pdf';
    return 'file';
  };

  const mediaType = getMediaType(message.mediaUrl);

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] px-4 py-3 rounded-3xl text-[17px] leading-relaxed ${
        isSelf
          ? 'bg-snap-yellow text-white rounded-br-none'
          : 'bg-snap-darkMid text-white rounded-bl-none'
      }`}>
        {message.text && <p>{message.text}</p>}

        {message.mediaUrl && mediaType === 'image' && (
          <img src={message.mediaUrl} alt="media" className="rounded-2xl max-h-[280px] mt-1 max-w-full" />
        )}
        {message.mediaUrl && mediaType === 'video' && (
          <video src={message.mediaUrl} controls className="rounded-2xl max-h-[280px] mt-1 max-w-full" />
        )}
        {message.mediaUrl && (mediaType === 'pdf' || mediaType === 'file') && (
          <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 mt-1 p-2 bg-black/20 rounded-lg hover:bg-black/40 transition">
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
import { useState } from 'react';
import { Camera, Send } from 'lucide-react';

const ChatInput = ({ onSend, onAttach, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="bg-snap-darkMid border-t border-white/10 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onAttach}
        disabled={disabled}
        className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-40"
      >
        <Camera size={24} />
      </button>

      <div className="flex-1 relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send a message..."
          disabled={disabled}
          className="w-full bg-snap-dark border border-white/10 rounded-3xl px-6 py-3 pr-14 focus:outline-none focus:border-snap-yellow disabled:opacity-50"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="p-3 bg-snap-yellow text-black rounded-full disabled:opacity-40 transition"
      >
        <Send size={24} />
      </button>
    </div>
  );
};

export default ChatInput;
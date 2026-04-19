import { useState, useRef } from 'react';
import { Camera, Send, Paperclip } from 'lucide-react';
import { uploadFile } from '../../services/uploadService';
import { useAppSelector } from '../../redux/hooks';

const ChatInput = ({ onSend, onAttach, disabled = false, roomId }) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { accessToken } = useAppSelector((state) => state.auth);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim(), null);
      setText('');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    try {
      setUploading(true);
      const response = await uploadFile(file, 'chat-attachment', accessToken);
      
      if (response?.url || response?.secure_url) {
        const fileUrl = response.url || response.secure_url;
        // Send message with file URL as mediaUrl instead of text
        onSend(null, fileUrl);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-snap-darkMid border-t border-white/10 px-4 py-3 flex items-center gap-3">
      {/* File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
        accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.pdf,.doc,.docx"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-40"
        title="Upload file"
      >
        <Paperclip size={24} />
      </button>

      {/* Camera Button */}
      <button
        onClick={onAttach}
        disabled={disabled}
        className="p-3 hover:bg-white/10 rounded-full transition disabled:opacity-40"
        title="Snap camera"
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
          disabled={disabled || uploading}
          className="w-full bg-snap-dark border border-white/10 rounded-3xl px-6 py-3 pr-14 focus:outline-none focus:border-snap-yellow disabled:opacity-50"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled || uploading}
        className="p-3 bg-snap-yellow text-black rounded-full disabled:opacity-40 transition"
      >
        <Send size={24} />
      </button>
    </div>
  );
};

export default ChatInput;
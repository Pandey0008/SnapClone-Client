import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { API_BASE_URL } from '../config/api';
import Avatar from '../components/common/Avatar';
import CaptionInput from '../components/camera/CaptionInput';
import { Send, ChevronLeft } from 'lucide-react';

const SendSnap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);

  const { uri, type } = location.state || {};

  const [caption, setCaption] = useState('');
  const [step, setStep] = useState('preview');
  const [friends, setFriends] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/friends`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFriends(data.friends || []);
        }
      } catch (err) {
        console.error('Failed to load friends:', err);
      }
    };
    if (accessToken) fetchFriends();
  }, [accessToken]);

  const toggleRecipient = (id) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!selectedRecipients.length || sending) return;
    setSending(true);
    setError('');

    try {
      const fetchRes = await fetch(uri);
      const blob = await fetchRes.blob();
      const file = new File(
        [blob],
        `snap.${type === 'video' ? 'mp4' : 'jpg'}`,
        { type: type === 'video' ? 'video/mp4' : 'image/jpeg' }
      );

      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipientIds', JSON.stringify(selectedRecipients));
      formData.append('caption', caption);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round(e.loaded / e.total * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(JSON.parse(xhr.responseText)?.error || 'Failed to send snap'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', `${API_BASE_URL}/api/v1/snaps/send`);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.send(formData);
      });

      navigate('/camera', { replace: true });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  if (!uri) {
    return (
      <div className="min-h-screen bg-snap-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-snap-white50 mb-4">No photo taken yet</p>
          <button onClick={() => navigate('/camera')} className="px-6 py-3 bg-snap-yellow text-white rounded-full font-bold">
            Open Camera
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 1: Preview ──
  if (step === 'preview') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">

        {/* Top bar — fixed, never pushed off screen */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-10 pb-3 bg-black/70 z-10">
          <button onClick={() => navigate('/camera')} className="p-2 bg-white/10 rounded-full">
            <ChevronLeft size={28} />
          </button>
          <span className="text-white font-semibold text-lg">Preview</span>
          <div className="w-10" />
        </div>

        {/* Media — fills remaining space with min-h-0 so it doesn't push button out */}
        <div className="flex-1 min-h-0 relative">
          {type === 'video'
            ? <video src={uri} autoPlay loop muted playsInline className="w-full h-full object-contain" />
            : <img src={uri} alt="snap preview" className="w-full h-full object-contain" />
          }
          <div className="absolute bottom-4 left-4 right-4">
            <CaptionInput value={caption} onChange={setCaption} maxLength={150} />
          </div>
        </div>

        {/* Send button — fixed at bottom, always visible */}
        <div className="flex-shrink-0 bg-snap-darkMid px-6 py-5 border-t border-white/10">
          <button
            onClick={() => setStep('recipients')}
            className="w-full bg-snap-yellow text-white font-bold text-lg rounded-full py-4 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Send size={20} />
            Send To...
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 2: Pick recipients ──
  return (
    <div className="fixed inset-0 bg-snap-dark flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-4 border-b border-white/10">
        <button onClick={() => setStep('preview')} className="p-2">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-xl font-bold flex-1">Send To</h2>
        <div className="w-10 h-14 rounded-lg overflow-hidden border border-snap-yellow">
          <img src={uri} alt="snap" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Friends list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {friends.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-snap-white50">No friends yet</p>
            <p className="text-sm text-snap-white50 mt-1">Add friends in the Discover tab first</p>
          </div>
        ) : (
          friends.map(friend => {
            const selected = selectedRecipients.includes(friend._id);
            return (
              <div
                key={friend._id}
                onClick={() => toggleRecipient(friend._id)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                  selected
                    ? 'bg-snap-yellow/20 border border-snap-yellow'
                    : 'bg-snap-darkMid border border-transparent'
                }`}
              >
                <Avatar uri={friend.avatarUrl} name={friend.displayName} size={48} />
                <div className="flex-1">
                  <p className="font-semibold">{friend.displayName}</p>
                  <p className="text-xs text-snap-white50">@{friend.username || 'user'}</p>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                  selected ? 'bg-snap-yellow border-snap-yellow' : 'border-white/30'
                }`}>
                  {selected && <span className="text-white text-sm font-bold">✓</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && <p className="text-red-400 text-center text-sm px-6 py-2 flex-shrink-0">{error}</p>}

      {/* Send button */}
      <div className="flex-shrink-0 px-6 py-5 border-t border-white/10 bg-snap-darkMid">
        {sending ? (
          <div className="text-center">
            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
              <div className="bg-snap-yellow h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-snap-white50 text-sm">Sending... {uploadProgress}%</p>
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={selectedRecipients.length === 0}
            className={`w-full font-bold text-lg rounded-full py-4 flex items-center justify-center gap-2 transition ${
              selectedRecipients.length > 0
                ? 'bg-snap-yellow text-white active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
            {selectedRecipients.length > 0
              ? `Send to ${selectedRecipients.length} ${selectedRecipients.length === 1 ? 'person' : 'people'} 👻`
              : 'Select someone to send'
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default SendSnap;
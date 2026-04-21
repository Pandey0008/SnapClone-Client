import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { API_BASE_URL } from '../config/api';
import { X, Flame } from 'lucide-react';
import Avatar from '../components/common/Avatar';

const SNAP_DURATION_IMAGE = 5;  // seconds to show image snap
const SNAP_DURATION_VIDEO = 15; // max seconds for video

const SnapViewer = () => {
  const { snapId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);

  const [snap, setSnap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchSnap = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/snaps/${snapId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.status === 410) {
          setError('This snap has already been viewed.');
          return;
        }
        if (res.status === 404) {
          setError('Snap not found or expired.');
          return;
        }
        if (!res.ok) {
          setError('Failed to load snap.');
          return;
        }

        const data = await res.json();
        setSnap(data);

        // Start countdown timer
        const duration = data.mediaType === 'video' ? SNAP_DURATION_VIDEO : SNAP_DURATION_IMAGE;
        setTimeLeft(duration);
      } catch (err) {
        setError('Failed to load snap.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnap();
  }, [snapId, accessToken]);

  // Auto-close countdown
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      navigate(-1);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-snap-yellow" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <Flame size={48} className="text-snap-yellow" />
        <p className="text-white text-xl font-bold">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 bg-snap-yellow text-white rounded-full font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const duration = snap.mediaType === 'video' ? SNAP_DURATION_VIDEO : SNAP_DURATION_IMAGE;
  const progress = timeLeft !== null ? (timeLeft / duration) * 100 : 100;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-1000 linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-5 pt-6 pb-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar uri={snap.sender?.avatarUrl} name={snap.sender?.displayName} size={38} />
          <div>
            <p className="font-semibold text-sm">{snap.sender?.displayName}</p>
            <p className="text-xs text-white/60">
              {new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="p-1">
          <X size={28} className="text-white" />
        </button>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center">
        {snap.mediaType === 'video' ? (
          <video
            src={snap.mediaUrl}
            autoPlay
            playsInline
            className="max-h-full max-w-full object-contain"
            onEnded={() => navigate(-1)}
          />
        ) : (
          <img
            src={snap.mediaUrl}
            alt="snap"
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Caption */}
      {snap.caption && (
        <div className="absolute bottom-20 left-0 right-0 px-6 text-center">
          <p className="text-white text-lg font-medium bg-black/50 rounded-2xl px-4 py-2 inline-block">
            {snap.caption}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-black/80 to-transparent text-center">
        <p className="text-white/50 text-sm flex items-center justify-center gap-1">
          <Flame size={14} className="text-snap-yellow" />
          Disappears in {timeLeft}s
        </p>
      </div>
    </div>
  );
};

export default SnapViewer;
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { X, Flame } from 'lucide-react';

const SnapViewer = () => {
  const { snapId } = useParams();
  const navigate = useNavigate();

  // Mock snap data
  const snap = {
    _id: snapId,
    mediaUrl: 'https://picsum.photos/id/1015/720/1280',
    sender: { displayName: 'Rahul Sharma' },
    type: 'photo',
    createdAt: 'Just now',
    viewedBy: []
  };

  useEffect(() => {
    // Auto mark as viewed
    console.log(`Marked snap ${snapId} as viewed`);
  }, [snapId]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/90 to-transparent z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-snap-yellow rounded-full flex items-center justify-center">
            <Flame className="text-black" size={20} />
          </div>
          <div>
            <p className="font-semibold">{snap.sender.displayName}</p>
            <p className="text-xs text-snap-white50">{snap.createdAt}</p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="text-4xl text-white"
        >
          <X size={32} />
        </button>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <img
          src={snap.mediaUrl}
          alt="snap"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Bottom Bar */}
      <div className="p-6 bg-gradient-to-t from-black/90 to-transparent text-center">
        <p className="text-sm text-snap-white50">Tap to close • Snaps disappear after viewing</p>
      </div>
    </div>
  );
};

export default SnapViewer;
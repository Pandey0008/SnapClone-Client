import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setFilter, setRecording } from '../redux/slices/uiSlice';
import CameraView from '../components/camera/CameraView';
import FilterCarousel from '../components/camera/FilterCarousel';
import TimerOverlay from '../components/camera/TimerOverlay';
import { Camera as CameraIcon, RotateCw, X } from 'lucide-react';   // ← Fixed here

const CameraScreen = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { activeFilter, isRecording } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      navigate('/snap/send', { state: { uri: screenshot, type: 'photo' } });
    }
  }, [navigate]);

  const handlePointerDown = () => {
    if (isVideoMode) {
      dispatch(setRecording(true));
      setIsRecordingVideo(true);
      console.log("🎥 Recording started...");
    } else {
      capturePhoto();
    }
  };

  const handlePointerUp = () => {
    if (isRecordingVideo) {
      dispatch(setRecording(false));
      setIsRecordingVideo(false);
      console.log("⏹️ Recording stopped");
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera Feed */}
      <CameraView ref={webcamRef} onCapture={capturePhoto} filterKey={activeFilter} />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-12">
        <button
          onClick={() => navigate('/chat')}
          className="p-3 bg-black/40 backdrop-blur rounded-full"
        >
          <X size={28} />
        </button>

        <div className="flex gap-6 text-white">
          {/* Fixed: Replaced Flip with RotateCw */}
          <button 
            onClick={() => setIsVideoMode(!isVideoMode)} 
            className="text-xl"
          >
            {isVideoMode ? "📸" : "🎥"}
          </button>
          
          <button className="text-xl" onClick={() => alert("Camera flipped!")}>
            <RotateCw size={28} />
          </button>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-snap-yellow">
          <img 
            src={user?.avatarUrl || 'https://via.placeholder.com/150'} 
            alt="You" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Filter Carousel */}
      <FilterCarousel 
        selected={activeFilter} 
        onSelect={(key) => dispatch(setFilter(key))} 
      />

      {/* Shutter Button */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-20 h-20 rounded-full border-4 border-snap-yellow flex items-center justify-center active:scale-90 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 bg-white rounded-full" />
        </div>
      </div>

      {/* Timer Overlay */}
      <TimerOverlay
        active={isRecording}
        duration={10}
        onComplete={() => dispatch(setRecording(false))}
      />

      {/* Bottom Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-snap-white50 flex gap-8">
        <div>Tap for photo</div>
        <div>Hold for video</div>
      </div>
    </div>
  );
};

export default CameraScreen;
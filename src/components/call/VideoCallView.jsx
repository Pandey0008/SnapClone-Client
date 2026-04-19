import { memo } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2 } from 'lucide-react';

const VideoCallView = memo(({
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  duration,
  onMute,
  onCameraToggle,
  onEnd,
  onSpeaker
}) => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Remote Video (Main) */}
      <video
        autoPlay
        playsInline
        srcObject={remoteStream}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Self PiP */}
      <div className="absolute top-6 right-6 w-28 h-40 bg-black rounded-3xl overflow-hidden border-4 border-snap-yellow shadow-2xl">
        <video
          autoPlay
          playsInline
          muted
          srcObject={localStream}
          className="w-full h-full object-cover"
        />
        {isCameraOff && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <VideoOff size={40} className="text-white/70" />
          </div>
        )}
      </div>

      {/* Top Info */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-2 rounded-full text-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-call-green rounded-full animate-pulse" />
        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-6">
        <button
          onClick={onMute}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${isMuted ? 'bg-call-red' : 'bg-snap-darkMid'}`}
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button
          onClick={onCameraToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${isCameraOff ? 'bg-call-red' : 'bg-snap-darkMid'}`}
        >
          {isCameraOff ? <VideoOff size={28} /> : <Video size={28} />}
        </button>

        <button
          onClick={onEnd}
          className="w-16 h-16 bg-call-red rounded-full flex items-center justify-center"
        >
          <PhoneOff size={28} />
        </button>

        <button
          onClick={onSpeaker}
          className="w-16 h-16 bg-snap-darkMid rounded-full flex items-center justify-center"
        >
          <Volume2 size={28} />
        </button>
      </div>
    </div>
  );
});

export default VideoCallView;
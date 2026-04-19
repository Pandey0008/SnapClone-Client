import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setMuted, setCameraOff, endCall, setDuration } from '../redux/slices/callSlice';
import VideoCallView from '../components/call/VideoCallView';
import IncomingCallModal from '../components/call/IncomingCallModal';
import CallEndedSummary from '../components/call/CallEndedSummary';

const ActiveCall = () => {
  const dispatch = useAppDispatch();
  const { isInCall, isMuted, isCameraOff, duration, peer, localStream, remoteStream } = useAppSelector(state => state.call);
  
  const [callState, setCallState] = useState('incoming'); // incoming | connecting | active | ended

  // Simulate call progression
  useEffect(() => {
    if (callState === 'incoming') {
      setTimeout(() => setCallState('connecting'), 1500);
      setTimeout(() => setCallState('active'), 3500);
    }

    const timer = setInterval(() => {
      if (callState === 'active') {
        dispatch(setDuration(duration + 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [callState, duration, dispatch]);

  const handleEndCall = () => {
    dispatch(endCall());
    setCallState('ended');
  };

  if (callState === 'ended') {
    return (
      <CallEndedSummary
        peer={peer}
        duration={duration}
        connectionType="p2p"
        onCallAgain={() => setCallState('incoming')}
        onMessage={() => alert("Opening chat...")}
      />
    );
  }

  return (
    <>
      {callState === 'incoming' && (
        <IncomingCallModal
          caller={peer}
          onAccept={() => setCallState('active')}
          onDecline={() => {
            dispatch(endCall());
            window.history.back();
          }}
        />
      )}

      {(callState === 'connecting' || callState === 'active') && (
        <VideoCallView
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          duration={duration}
          onMute={() => dispatch(setMuted(!isMuted))}
          onCameraToggle={() => dispatch(setCameraOff(!isCameraOff))}
          onEnd={handleEndCall}
          onSpeaker={() => alert("Speaker toggled")}
        />
      )}
    </>
  );
};

export default ActiveCall;
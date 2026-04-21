import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setMuted, setCameraOff, endCall, setDuration, clearIncomingCall } from '../redux/slices/callSlice';
import VideoCallView from '../components/call/VideoCallView';
import CallEndedSummary from '../components/call/CallEndedSummary';
import { getSocket } from '../redux/socketHook';
import RTCConnection from '../services/rtcService';

const rtc = new RTCConnection();

const ActiveCall = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isMuted, isCameraOff, duration, peer, incomingCall } = useAppSelector(state => state.call);

  const [callState, setCallState] = useState('connecting');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const durationIntervalRef = useRef(null);
  const initializedRef = useRef(false);

  // Snapshot remotePeer immediately into a ref — derived from Redux which gets cleared on endCall
  const remotePeerComputed = incomingCall
    ? { displayName: incomingCall.fromName, avatarUrl: incomingCall.fromAvatar, _id: incomingCall.from }
    : peer;
  const remotePeerRef = useRef(remotePeerComputed);
  if (remotePeerComputed) remotePeerRef.current = remotePeerComputed; // keep in sync while data exists

  // Also snapshot duration in a ref so call-ended handler has the latest value (not stale closure)
  const durationRef = useRef(duration);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // Snapshot callState in ref so handleEndCall inside the effect closure sees latest value
  const callStateRef = useRef(callState);
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const isCallee = !!incomingCall;

  // Stable handleEndCall that reads from refs, not stale closure values
  const handleEndCall = useRef(null);
  handleEndCall.current = (notifyRemote = true) => {
    // Remove all call-related socket listeners immediately to prevent re-triggering
    const socket = getSocket();
    socket?.off('call-ended');
    socket?.off('offer');
    socket?.off('answer');
    socket?.off('ice-candidate');

    if (notifyRemote && remotePeerRef.current?._id) {
      socket?.emit('call-end', { to: remotePeerRef.current._id });
    }
    rtc.endCall();
    dispatch(endCall());
    dispatch(clearIncomingCall());
    setCallState('ended');
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const socket = getSocket();

    // FIX: Always remove any stale listeners from a previous call before attaching new ones
    socket?.off('offer');
    socket?.off('answer');
    socket?.off('ice-candidate');
    socket?.off('call-ended');

    const initCall = async () => {
      try {
        const stream = await rtc.getLocalStream();
        setLocalStream(stream);

        rtc.initPeerConnection();

        rtc.peerConnection.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          setCallState('active');
        };

        rtc.peerConnection.onicecandidate = (event) => {
          if (event.candidate && remotePeerRef.current?._id) {
            socket?.emit('ice-candidate', { to: remotePeerRef.current._id, candidate: event.candidate });
          }
        };

        if (isCallee) {
          socket?.on('offer', async ({ sdp }) => {
            const answer = await rtc.createAnswer(sdp);
            socket.emit('answer', { to: remotePeerRef.current._id, sdp: answer });
          });
        } else {
          const offer = await rtc.createOffer();
          socket?.emit('offer', { to: remotePeerRef.current._id, sdp: offer });

          socket?.on('answer', async ({ sdp }) => {
            await rtc.addRemoteAnswer(sdp);
          });
        }

        socket?.on('ice-candidate', async ({ candidate }) => {
          await rtc.addIceCandidate(candidate);
        });

        // FIX: Use a named handler so it can be removed cleanly, and use ref for handleEndCall
        // to avoid stale closure capturing old state
        socket?.on('call-ended', () => {
          handleEndCall.current(false);
        });

        setError(null);
      } catch (err) {
        console.error('Error setting up call:', err);
        if (err.name === 'NotAllowedError') {
          setError('Camera/Microphone permission denied. Please allow access and refresh.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found on this device.');
        } else {
          setError(err.message);
        }
      }
    };

    initCall();

    return () => {
      socket?.off('offer');
      socket?.off('answer');
      socket?.off('ice-candidate');
      socket?.off('call-ended');
      rtc.endCall();
    };
  }, []);

  // Duration timer — only runs when active
  useEffect(() => {
    if (callState === 'active') {
      durationIntervalRef.current = setInterval(() => {
        dispatch(setDuration(durationRef.current + 1));
      }, 1000);
    }
    return () => { if (durationIntervalRef.current) clearInterval(durationIntervalRef.current); };
  }, [callState, dispatch]);

  // ── Render ──

  if (error) {
    return (
      <div className="fixed inset-0 bg-snap-dark z-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-snap-yellow">Permission Required</h2>
          <p className="text-snap-white50 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-snap-yellow text-snap-dark rounded-full font-semibold">
            Refresh & Try Again
          </button>
          <button
            onClick={() => { dispatch(endCall()); dispatch(clearIncomingCall()); navigate('/chat', { replace: true }); }}
            className="mt-4 ml-3 px-6 py-3 bg-snap-darkMid text-white rounded-full font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (callState === 'ended') {
    return (
      <CallEndedSummary
        peer={remotePeerRef.current}
        duration={durationRef.current}   // FIX: use ref — Redux duration is already reset to 0 by endCall()
        connectionType="p2p"
        onCallAgain={() => { dispatch(setDuration(0)); setCallState('connecting'); initializedRef.current = false; }}
        onMessage={() => navigate('/chat', { replace: true })}
      />
    );
  }

  if (callState === 'connecting') {
    return (
      <div className="fixed inset-0 bg-snap-dark z-40 flex flex-col items-center justify-center">
        <div className="text-center">
          {localStream && (
            <video
              autoPlay playsInline muted
              ref={el => { if (el) el.srcObject = localStream; }}
              className="w-40 h-56 rounded-2xl object-cover mx-auto mb-6 border-2 border-snap-yellow"
            />
          )}
          <h2 className="text-2xl font-bold mb-4">
            Connecting to {remotePeerRef.current?.displayName}...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-snap-yellow mx-auto" />
          <p className="text-snap-white50 mt-4 text-sm">Waiting for the other person to connect</p>
          <button
            onClick={() => handleEndCall.current(true)}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full text-sm"
          >
            Cancel Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoCallView
      localStream={localStream}
      remoteStream={remoteStream}
      isMuted={isMuted}
      isCameraOff={isCameraOff}
      duration={duration}
      onMute={() => { rtc.toggleAudio(isMuted); dispatch(setMuted(!isMuted)); }}
      onCameraToggle={() => { rtc.toggleVideo(isCameraOff); dispatch(setCameraOff(!isCameraOff)); }}
      onEnd={() => handleEndCall.current(true)}
      onSpeaker={() => alert('Speaker toggled')}
    />
  );
};

export default ActiveCall;
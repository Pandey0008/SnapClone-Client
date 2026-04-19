import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setIncomingCall, clearIncomingCall } from '../../redux/slices/callSlice';
import IncomingCallModal from './IncomingCallModal';
import { getSocket } from '../../redux/socketHook';

const IncomingCallHandler = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { incomingCall } = useAppSelector((state) => state.call);
  const { user } = useAppSelector((state) => state.auth);

  // BUG FIX: Hide modal when already on /call/active so it doesn't overlay the call screen
  const isOnCallScreen = window.location.pathname === '/call/active';
  if (!incomingCall || isOnCallScreen) {
    return null;
  }

  const caller = {
    displayName: incomingCall.fromName || 'Unknown Caller',
    avatarUrl: incomingCall.fromAvatar,
    _id: incomingCall.from
  };

  const handleAccept = () => {
    console.log('Call accepted');

    getSocket()?.emit('call-accept', {
      to: incomingCall.from,
      from: user._id
    });

    // BUG FIX: Do NOT clear incomingCall here — ActiveCall.jsx needs it to know who the remote peer is.
    // Just navigate. ActiveCall will clear it when the call ends.
    navigate('/call/active', { replace: true });
  };

  const handleDecline = () => {
    console.log('Call declined');
    getSocket()?.emit('call-reject', {
      to: incomingCall.from,
      from: user._id
    });
    dispatch(clearIncomingCall());
  };

  return (
    <IncomingCallModal
      caller={caller}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
};

export default IncomingCallHandler;
import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    incomingCall: null, // { from, callType: 'video' | 'voice' }
    isInCall: false,
    isMuted: false,
    isCameraOff: false,
    isSpeaker: true,
    duration: 0,
    peer: null,
    localStream: null,
    remoteStream: null,
    connectionType: null, // 'p2p' | 'turn'
  },
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
    startCall: (state, action) => {
      state.isInCall = true;
      state.peer = action.payload.peer;
    },
    endCall: (state) => {
      state.isInCall = false;
      state.duration = 0;
      state.localStream = null;
      state.remoteStream = null;
      state.peer = null;
    },
    setMuted: (state, action) => {
      state.isMuted = action.payload;
    },
    setCameraOff: (state, action) => {
      state.isCameraOff = action.payload;
    },
    setSpeaker: (state, action) => {
      state.isSpeaker = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setStreams: (state, action) => {
      state.localStream = action.payload.localStream;
      state.remoteStream = action.payload.remoteStream;
    },
  },
});

export const { 
  setIncomingCall,
  clearIncomingCall,
  startCall, 
  endCall, 
  setMuted, 
  setCameraOff, 
  setSpeaker, 
  setDuration, 
  setStreams 
} = callSlice.actions;

export default callSlice.reducer;
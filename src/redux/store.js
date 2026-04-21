import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';
import callReducer from './slices/callSlice';
import snapReducer from './slices/snapSlice';
import onlineReducer from './slices/onlineSlice';
import storyReducer from "./slices/storySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer,
    call: callReducer,
    snap: snapReducer,
    online: onlineReducer,
    stories: storyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore WebRTC streams, sockets, and large objects
        ignoredActions: ['call/setLocalStream', 'call/setRemoteStream'],
        ignoredPaths: ['call.localStream', 'call.remoteStream'],
      },
    }),
});

export default store;
import { createSlice } from '@reduxjs/toolkit';

const snapSlice = createSlice({
  name: 'snap',
  initialState: {
    inbox: [], // [{ snapId, senderId, senderName, senderAvatar, mediaType, caption }]
  },
  reducers: {
    addIncomingSnap: (state, action) => {
      // Avoid duplicates
      const exists = state.inbox.find(s => s.snapId === action.payload.snapId);
      if (!exists) state.inbox.push(action.payload);
    },
    removeSnap: (state, action) => {
      state.inbox = state.inbox.filter(s => s.snapId !== action.payload);
    },
    setSnapInbox: (state, action) => {
      state.inbox = action.payload;
    },
  },
});

export const { addIncomingSnap, removeSnap, setSnapInbox } = snapSlice.actions;
export default snapSlice.reducer;
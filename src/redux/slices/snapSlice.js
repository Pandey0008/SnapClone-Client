import { createSlice } from '@reduxjs/toolkit';

const snapSlice = createSlice({
  name: 'snap',
  initialState: {
    feed: [],
    sentSnaps: [],
    viewingSnapId: null,
  },
  reducers: {
    setFeed: (state, action) => {
      state.feed = action.payload;
    },
    addSentSnap: (state, action) => {
      state.sentSnaps.unshift(action.payload);
    },
    setViewingSnap: (state, action) => {
      state.viewingSnapId = action.payload;
    },
  },
});

export const { setFeed, addSentSnap, setViewingSnap } = snapSlice.actions;
export default snapSlice.reducer;
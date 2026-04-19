import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeFilter: null,
    cameraMode: 'photo', // 'photo' | 'video'
    isRecording: false,
  },
  reducers: {
    setFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    setCameraMode: (state, action) => {
      state.cameraMode = action.payload;
    },
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    resetUI: (state) => {
      state.activeFilter = null;
      state.isRecording = false;
    },
  },
});

export const { setFilter, setCameraMode, setRecording, resetUI } = uiSlice.actions;
export default uiSlice.reducer;
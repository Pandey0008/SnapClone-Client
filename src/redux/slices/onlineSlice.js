import { createSlice } from '@reduxjs/toolkit';

const onlineSlice = createSlice({
  name: 'online',
  initialState: {
    onlineUsers: [], // Array of user IDs that are online
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
  },
});

export const { setOnlineUsers, addOnlineUser, removeOnlineUser } = onlineSlice.actions;
export default onlineSlice.reducer;

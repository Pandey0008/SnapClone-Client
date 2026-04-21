import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    messages: {},       // roomId → array of messages
    typingUsers: {},    // roomId → userIds[]
    unreadCount: 0,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    appendMessage: (state, action) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) state.messages[roomId] = [];

      const messageToStore = {
        ...message,
        createdAt: message.createdAt instanceof Date
          ? message.createdAt.toISOString()
          : message.createdAt || new Date().toISOString()
      };
      state.messages[roomId].push(messageToStore);
    },

    setTyping: (state, action) => {
      const { roomId, userId, isTyping } = action.payload;
      if (!state.typingUsers[roomId]) state.typingUsers[roomId] = [];
      if (isTyping) {
        if (!state.typingUsers[roomId].includes(userId)) {
          state.typingUsers[roomId].push(userId);
        }
      } else {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(id => id !== userId);
      }
    },

    setMessagesByRoom: (state, action) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
    },

    // Called when snap-message-viewed socket event fires
    // Updates the bubble from "Tap to Open" → "Snap Viewed" for both users
    markSnapViewed: (state, action) => {
      const { snapId } = action.payload;
      for (const roomId in state.messages) {
        state.messages[roomId] = state.messages[roomId].map(msg =>
          msg.snapId?.toString() === snapId?.toString()
            ? { ...msg, snapViewed: true }
            : msg
        );
      }
    },

    markAsRead: (state, action) => {},
  },
});

export const {
  setConversations,
  appendMessage,
  setTyping,
  setMessagesByRoom,
  markSnapViewed,
  markAsRead
} = chatSlice.actions;

export default chatSlice.reducer;
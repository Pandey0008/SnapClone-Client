// src/redux/slices/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    messages: {},           // roomId → array of messages
    typingUsers: {},        // roomId → userIds[]
    unreadCount: 0,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    appendMessage: (state, action) => {
      const { roomId, message } = action.payload;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }

      // Ensure createdAt is always a string (ISO format)
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

    markAsRead: (state, action) => {
      // Future implementation
    },
  },
});

export const { setConversations, appendMessage, setTyping, setMessagesByRoom, markAsRead } = chatSlice.actions;
export default chatSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";   // already used in other files

// ADD this thunk before the slice definition
export const fetchReplySuggestions = createAsyncThunk(
  "chat/fetchReplySuggestions",
  async ({ message, context = [], accessToken }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/ai/suggest-reply`,
        { message, context },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 20000,
        }
      );
      return data.suggestions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: {}, // roomId → array of messages
    typingUsers: {}, // roomId → userIds[]
    unreadCount: 0,
    suggestions: [],
    suggestionsLoading: false,
    suggestionsError: null,
  },
  reducers: {
    setConversations: (state, action) => {
      // ✅ Never let a non-array value into state
      state.conversations = Array.isArray(action.payload) ? action.payload : [];
    },
    appendMessage: (state, action) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) state.messages[roomId] = [];

      const messageToStore = {
        ...message,
        createdAt:
          message.createdAt instanceof Date
            ? message.createdAt.toISOString()
            : message.createdAt || new Date().toISOString(),
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
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(
          (id) => id !== userId,
        );
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
        state.messages[roomId] = state.messages[roomId].map((msg) =>
          msg.snapId?.toString() === snapId?.toString()
            ? { ...msg, snapViewed: true }
            : msg,
        );
      }
    },

    markAsRead: (state, action) => {},

    clearSuggestions: (state) => {
      state.suggestions = [];
      state.suggestionsError = null;
      state.suggestionsLoading = false;
    },
  },

  // ADD this after reducers:
  extraReducers: (builder) => {
    builder
      .addCase(fetchReplySuggestions.pending, (state) => {
        state.suggestionsLoading = true;
        state.suggestionsError = null;
        state.suggestions = [];
      })
      .addCase(fetchReplySuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload || [];
      })
      .addCase(fetchReplySuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestionsError = action.payload;
        state.suggestions = [];
      })
  },
});

export const {
  setConversations,
  appendMessage,
  setTyping,
  setMessagesByRoom,
  markSnapViewed,
  markAsRead,
  clearSuggestions,
} = chatSlice.actions;

export default chatSlice.reducer;

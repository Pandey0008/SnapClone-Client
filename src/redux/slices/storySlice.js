import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getStoriesFeedAPI,
  getArchivedStoriesAPI,
} from "./../../services/storyService";

// In your thunk, extract the actual array from the response
export const fetchStoriesFeed = createAsyncThunk("stories/feed", async () => {
  const res = await getStoriesFeedAPI();
console.log("storiesFeed API response:", res.data); // ← Check this in DevTools
  // ✅ Extract the array — adjust the key to match your actual API response shape
  return res.data?.stories ?? res.data ?? [];
});

export const fetchArchivedStories = createAsyncThunk(
  "stories/archive",
  async () => {
    const res = await getArchivedStoriesAPI();
    return res.data?.stories ?? res.data ?? [];
  },
);

const storySlice = createSlice({
  name: "stories",

  initialState: {
    storiesFeed: [],
    archivedStories: [],
    loading: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchStoriesFeed.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchStoriesFeed.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Ensure it's always an array
        state.storiesFeed = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchArchivedStories.fulfilled, (state, action) => {
        state.archivedStories = Array.isArray(action.payload)
          ? action.payload
          : [];
      });
  },
});

export default storySlice.reducer;

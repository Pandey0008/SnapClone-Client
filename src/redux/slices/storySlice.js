import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getStoriesFeedAPI,
  getArchivedStoriesAPI,
} from "./../../services/storyService";


// FETCH ACTIVE STORIES
export const fetchStoriesFeed = createAsyncThunk(
  "stories/feed",
  async () => {
    const res = await getStoriesFeedAPI();
    return res.data;
  }
);


// FETCH ARCHIVED STORIES
export const fetchArchivedStories = createAsyncThunk(
  "stories/archive",
  async () => {
    const res = await getArchivedStoriesAPI();
    return res.data;
  }
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
        state.storiesFeed = action.payload;
      })

      .addCase(fetchArchivedStories.fulfilled, (state, action) => {
        state.archivedStories = action.payload;
      });

  },
});


export default storySlice.reducer;
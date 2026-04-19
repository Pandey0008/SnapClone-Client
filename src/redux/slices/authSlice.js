import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    hydrated: false, // Flag to track if we've loaded from localStorage
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Persist to localStorage
      const authData = {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
      localStorage.setItem('authData', JSON.stringify(authData));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clear from localStorage
      localStorage.removeItem('authData');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // Restore from localStorage
    restoreCredentials: (state) => {
      try {
        const authData = localStorage.getItem('authData');
        if (authData) {
          const parsed = JSON.parse(authData);
          state.user = parsed.user;
          state.accessToken = parsed.accessToken;
          state.refreshToken = parsed.refreshToken;
          state.isAuthenticated = true;
        }
      } catch (err) {
        console.error('Error restoring auth data:', err);
      }
      state.hydrated = true;
    },
  },
});

export const { setCredentials, clearCredentials, updateUser, restoreCredentials } = authSlice.actions;
export default authSlice.reducer;
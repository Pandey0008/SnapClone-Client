// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { restoreCredentials } from './redux/slices/authSlice';

// Screens
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';

import Camera from './screens/Camera';
import ChatList from './screens/ChatList';
import ChatThread from './screens/ChatThread';
import Stories from './screens/Stories';
import Discover from './screens/Discover';
import Profile from './screens/Profile';

import SendSnap from './screens/SendSnap';
import SnapViewer from './screens/SnapViewer';
import ActiveCall from './screens/ActiveCall';

// Components
import BottomTabBar from './components/common/BottomTabBar';
import IncomingCallHandler from './components/call/IncomingCallHandler';

function AppContent() {
  const { isAuthenticated, hydrated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Main tab routes where bottom bar should appear
  const mainTabRoutes = ['/camera', '/chat', '/stories', '/discover', '/profile'];

  // Hide bottom bar on these screens
  const hideTabBarRoutes = ['/chat/', '/snap/', '/call/'];

  const shouldShowTabBar = 
    isAuthenticated && 
    mainTabRoutes.some(route => location.pathname === route) &&
    !hideTabBarRoutes.some(route => location.pathname.startsWith(route));

  // Don't render until hydration is complete
  if (!hydrated) {
    return <div className="min-h-screen bg-snap-dark" />;
  }

  return (
    <div className="relative min-h-screen bg-snap-dark text-white">
      {/* Global incoming call handler - shows modal across entire app */}
      <IncomingCallHandler />
      
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/camera" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/camera" replace />} />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/camera" element={<Camera />} />
            <Route path="/chat" element={<ChatList />} />
            <Route path="/chat/:roomId" element={<ChatThread />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/profile" element={<Profile />} />

            {/* Modals / Full screens */}
            <Route path="/snap/send" element={<SendSnap />} />
            <Route path="/snap/view/:snapId" element={<SnapViewer />} />
            <Route path="/call/active" element={<ActiveCall />} />

            <Route path="/" element={<Navigate to="/camera" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>

      {/* Bottom Tab Bar - Only on main tabs */}
      {shouldShowTabBar && <BottomTabBar />}
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore auth credentials from localStorage on app load
    dispatch(restoreCredentials());
  }, [dispatch]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
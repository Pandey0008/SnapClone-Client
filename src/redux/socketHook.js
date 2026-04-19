import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch } from './hooks';
import { appendMessage, setTyping } from '../redux/slices/chatSlice';
import { setOnlineUsers, addOnlineUser, removeOnlineUser } from '../redux/slices/onlineSlice';

let socketInstance = null;

export const useSocket = (user) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    // Connect to Socket.IO server if not already connected
    if (!socketInstance) {
      socketInstance = io('http://localhost:3000', {
        auth: {
          userId: user._id
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      console.log('Connected to Socket.IO');

      // Listen for online users list
      socketInstance.on('online-users', (userIds) => {
        console.log('Online users:', userIds);
        dispatch(setOnlineUsers(userIds));
      });

      // Listen for user-online event
      socketInstance.on('user-online', (userId) => {
        console.log('User came online:', userId);
        dispatch(addOnlineUser(userId));
      });

      // Listen for user-offline event
      socketInstance.on('user-offline', (userId) => {
        console.log('User went offline:', userId);
        dispatch(removeOnlineUser(userId));
      });

      // Listen for new messages
      socketInstance.on('new-message', ({ roomId, message }) => {
        console.log('Received message:', message);
        dispatch(appendMessage({ roomId, message }));
      });

      // Listen for typing indicators
      socketInstance.on('typing-indicator', ({ userId, isTyping }) => {
        // Handle typing indicator if needed
        console.log('User typing:', userId, isTyping);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from Socket.IO');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on component unmount - keep connection alive
    };
  }, [user?._id, dispatch]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;

export const joinRoom = (roomId) => {
  if (socketInstance) {
    socketInstance.emit('join-room', { roomId });
    console.log('Joined room:', roomId);
  }
};

export const leaveRoom = (roomId) => {
  if (socketInstance) {
    socketInstance.emit('leave-room', { roomId });
  }
};

export const sendTypingIndicator = (roomId, isTyping) => {
  if (socketInstance) {
    socketInstance.emit('typing', { roomId, isTyping });
  }
};


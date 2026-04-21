import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api";
import { useAppDispatch } from "./hooks";
import {
  appendMessage,
  setTyping,
  markSnapViewed,
} from "../redux/slices/chatSlice";
import {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from "../redux/slices/onlineSlice";
import { setIncomingCall } from "../redux/slices/callSlice";
import { addIncomingSnap } from "../redux/slices/snapSlice";

let socketInstance = null;

export const useSocket = (user) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    if (!socketInstance) {
      socketInstance = io(API_BASE_URL, {
        auth: { userId: user._id },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketInstance.on("online-users", (userIds) =>
        dispatch(setOnlineUsers(userIds)),
      );
      socketInstance.on("user-online", (userId) =>
        dispatch(addOnlineUser(userId)),
      );
      socketInstance.on("user-offline", (userId) =>
        dispatch(removeOnlineUser(userId)),
      );

      socketInstance.on("new-message", ({ roomId, message }) => {
        dispatch(appendMessage({ roomId, message }));
      });

      socketInstance.on("typing-indicator", ({ userId, isTyping }) => {
        console.log("User typing:", userId, isTyping);
      });

      socketInstance.on(
        "video-call-incoming",
        ({ from, fromName, fromAvatar }) => {
          dispatch(
            setIncomingCall({ from, fromName, fromAvatar, callType: "video" }),
          );
        },
      );

      socketInstance.on(
        "voice-call-incoming",
        ({ from, fromName, fromAvatar }) => {
          dispatch(
            setIncomingCall({ from, fromName, fromAvatar, callType: "voice" }),
          );
        },
      );

      socketInstance.on(
        "snap-received",
        ({
          snapId,
          senderId,
          senderName,
          senderAvatar,
          mediaType,
          caption,
        }) => {
          dispatch(
            addIncomingSnap({
              snapId,
              senderId,
              senderName,
              senderAvatar,
              mediaType,
              caption,
            }),
          );
        },
      );

      // When snap is viewed — update the bubble in chat from 👻 → opened
      socketInstance.on("snap-message-viewed", ({ snapId }) => {
        dispatch(markSnapViewed({ snapId }));
      });

      socketInstance.on("disconnect", () =>
        console.log("Disconnected from Socket.IO"),
      );
      socketInstance.on("connect_error", (error) =>
        console.error("Socket.IO error:", error),
      );
    }

    socketRef.current = socketInstance;
    return () => {};
  }, [user?._id, dispatch]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;

export const joinRoom = (roomId) => {
  if (socketInstance) {
    socketInstance.emit("join-room", { roomId });
    console.log("Joined room:", roomId);
  }
};

export const leaveRoom = (roomId) => {
  if (socketInstance) socketInstance.emit("leave-room", { roomId });
};

export const sendTypingIndicator = (roomId, isTyping) => {
  if (socketInstance) socketInstance.emit("typing", { roomId, isTyping });
};

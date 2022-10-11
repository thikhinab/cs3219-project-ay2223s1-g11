import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export const useMatchingService = ({
  enabled,
  onConnected,
  onDisconnected,
}) => {
  const socketRef = useRef();

  // State can be simplified
  const [matchState, setMatchState] = useState({
    hasConnected: false,
    isPending: false,
    hasFailed: false,
    isSuccess: false,
    roomId: null,
    error: null
  });

  const findMatch = ({username, difficultyLevel}) => {
    socketRef.current.emit("findMatch", {username, difficultyLevel});
  };

  const disconnect = () => {
    socketRef.current.disconnect();
  };

  const updateOnConnected = () => {
    setMatchState((prevState) => {
      return { ...prevState, hasConnected: true };
    });
  };

  const updateOnDisconnected = () => {
    setMatchState((prevState) => {
      return { ...prevState, hasConnected: false };
    });
  };

  const updateOnMatchSuccess = (roomId) => {
    setMatchState((prevState) => {
      return {
        ...prevState,
        isPending: false,
        isSuccess: true,
        hasFailed: false,
        roomId,
      };
    });
  };

  const updateOnMatchFail = (error) => {
    setMatchState((prevState) => {
      return {
        ...prevState,
        isPending: false,
        isSuccess: false,
        hasFailed: true,
        error,
      };
    });
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = io("localhost:8001");

    socket.on("connected", () => {
      updateOnConnected();
      if (onConnected) {
        onConnected();
      }
    });

    socket.on("disconnect", () => {
      updateOnDisconnected();
      if (onDisconnected) {
        onDisconnected();
      }
    });

    socket.on("matchSuccess", ({roomId}) => {
      updateOnMatchSuccess(roomId);
    });

    socket.on("matchFail", ({error}) => {
      updateOnMatchFail(error);
    });

    socketRef.current = socket;

    return () => socket.disconnect();
  }, [enabled, onConnected, onDisconnected]);

  return { findMatch, disconnect, matchState };
};
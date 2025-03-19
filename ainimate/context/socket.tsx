"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Project } from "@/types/project";
import type { Scene } from "@/lib/store/scene-store";

interface StateUpdate {
  currentProject: Project | null;
  scenes: Scene[];
  activeScene: Scene | null;
  currentFrame: number;
  isPlaying: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  state: StateUpdate;
}

const initialState: StateUpdate = {
  currentProject: null,
  scenes: [],
  activeScene: null,
  currentFrame: 0,
  isPlaying: false,
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<StateUpdate>(initialState);

  useEffect(() => {
    const socketInstance = io("http://localhost:3003", {
      transports: ["websocket"],
      upgrade: false,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
      // Request initial state
      socketInstance.emit("request_state");
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason);
    });

    socketInstance.on("state_update", (newState: StateUpdate) => {
      console.log("State update received:", {
        scenes: newState.scenes,
        projects: newState.currentProject,
        frames: newState.currentFrame,
        hasProject: newState.currentProject !== null,
        sceneCount: newState.scenes.length,
        hasActiveScene: newState.activeScene !== null,
        currentFrame: newState.currentFrame,
        isPlaying: newState.isPlaying,
      });
      setState(newState);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, state }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

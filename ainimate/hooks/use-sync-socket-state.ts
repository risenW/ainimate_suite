import { useEffect, useRef, useCallback } from 'react'
import { Project } from "@/types/project";
import { useSceneStore, Scene } from "@/lib/store/scene-store";

import { useSocket } from "@/context/socket";
import { useProjectStore } from '@/lib/store/project-store';

export function useSyncSocketState() {

    const { socket } = useSocket();

    // Get scene state
    const scenes = useSceneStore((state) => state.scenes);
    const activeScene = useSceneStore((state) => state.activeScene);
    const currentFrame = useSceneStore((state) => state.currentFrame);
    const isPlaying = useSceneStore((state) => state.isPlaying);
    const currentProject = useProjectStore((state) => state.currentProject);

    // Track if update is from remote source
    const isRemoteUpdate = useRef<boolean>(false);
    const emitTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced emit function
  const debouncedEmit = useCallback(
    (data: {
      currentProject: Project;
      scenes: Scene[];
      activeScene: Scene | null;
      currentFrame: number;
      isPlaying: boolean;
    }) => {
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
      }

      emitTimeoutRef.current = setTimeout(() => {
        if (!isRemoteUpdate.current && socket) {
          socket.emit("update_state", data);
        }
        isRemoteUpdate.current = false;
      }, 100); // 100ms debounce
    },
    [socket]
  );

  // Sync project and scene state with socket when project loads or state changes
  useEffect(() => {
    if (socket && currentProject) {
      debouncedEmit({
        currentProject,
        scenes,
        activeScene,
        currentFrame,
        isPlaying,
      });
    }
  }, [
    socket,
    currentProject,
    scenes,
    activeScene,
    currentFrame,
    isPlaying,
    debouncedEmit,
  ]);

  // Listen for state updates from other clients
  useEffect(() => {
    if (!socket) return;

    const handleStateUpdate = (data: {
      currentProject: Project;
      scenes: Scene[];
      activeScene: Scene;
      currentFrame: number;
      isPlaying: boolean;
    }) => {
      // Only update if we have a current project
      if (!currentProject) return;

      // Set flag to prevent emit loop
      isRemoteUpdate.current = true;

      // Update scene store with received data
      useSceneStore.setState({
        scenes: data.scenes,
        activeScene: data.activeScene,
        currentFrame: data.currentFrame,
        isPlaying: data.isPlaying,
      });
    };

    socket.on("state_update", handleStateUpdate);

    return () => {
      socket.off("state_update", handleStateUpdate);
      // Clear any pending timeouts
      if (emitTimeoutRef.current) {
        clearTimeout(emitTimeoutRef.current);
      }
    };
  }, [socket, currentProject]);

  
}

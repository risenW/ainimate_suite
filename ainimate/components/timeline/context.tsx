import { createContext, useContext } from "react";
import type { Scene, SceneLayer } from "@/lib/store/scene-store";

export interface TimelineContextType {
  fps: number;
  duration: number;
  totalFrames: number;
  currentFrame: number;
  isPlaying: boolean;
  activeScene: Scene | null;
  handleFrameClick: (frameNumber: number, layerId: string) => void;
  handleDeleteFrame: (frameId: string) => void;
  handleResizeFrame: (
    frameId: string,
    newLength: number,
    newFrameNumber?: number
  ) => void;
  getPlayheadPosition: (frame: number) => number;
  isFrameSlotOccupied: (layer: SceneLayer, frameNumber: number) => boolean;
  isFrameSlotPartOfExpandedFrame: (
    layer: SceneLayer,
    frameNumber: number
  ) => boolean;
}

export const TimelineContext = createContext<TimelineContextType | null>(null);

export function useTimelineContext() {
  const context = useContext(TimelineContext);
  if (!context)
    throw new Error("useTimelineContext must be used within TimelineProvider");
  return context;
}

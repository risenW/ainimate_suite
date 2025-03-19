"use client";

import { useEffect, useCallback } from "react";
import { useSceneStore } from "@/lib/store/scene-store";
import type { SceneLayer } from "@/lib/store/scene-store";
import { Plus } from "lucide-react";
import { PlaybackControls } from "./playback-controls";
import { TimelineContext } from "./context";
import { TimelineHeader } from "./header";
import { LayerRow } from "./layer-row";
import { FrameGrid } from "./frame-grid";
import { useLayerPanelStore } from "@/lib/store/layer-panel-store";

export function Timeline({ fps, duration }: { fps: number; duration: number }) {
  const activeScene = useSceneStore((state) => state.activeScene);
  const currentFrame = useSceneStore((state) => state.currentFrame);
  const isPlaying = useSceneStore((state) => state.isPlaying);
  const { setPlaybackSettings } = useSceneStore();

  // Calculate total frames
  const totalFrames = duration * fps;

  // Set playback settings when they change
  useEffect(() => {
    setPlaybackSettings(fps, totalFrames);
  }, [fps, totalFrames, setPlaybackSettings]);

  const handleFrameClick = useCallback(
    (frameNumber: number, layerId: string) => {
      if (!activeScene) return;
      useSceneStore.getState().selectFrame(activeScene.id, frameNumber);
      // Set the clicked frame's layer as active
      useLayerPanelStore.getState().setActiveLayerId(layerId);
    },
    [activeScene]
  );

  const handleDeleteFrame = useCallback(
    (frameId: string) => {
      if (!activeScene) return;
      useSceneStore.getState().deleteFrame(activeScene.id, frameId);
    },
    [activeScene]
  );

  const handleResizeFrame = useCallback(
    (frameId: string, newLength: number, newFrameNumber?: number) => {
      if (!activeScene) return;
      useSceneStore
        .getState()
        .resizeFrame(activeScene.id, frameId, newLength, newFrameNumber);
    },
    [activeScene]
  );

  const getPlayheadPosition = useCallback(
    (frame: number) => {
      if (!activeScene) return frame * 32;

      // Find the frame that contains this position across all layers
      const containingFrame = activeScene.layers
        .flatMap((layer) => layer.frames)
        .find(
          (f) => frame >= f.frameNumber && frame < f.frameNumber + f.length
        );

      if (containingFrame) {
        const frameStart = containingFrame.frameNumber * 32;
        const progressInFrame = frame - containingFrame.frameNumber;
        return frameStart + progressInFrame * 32;
      }

      return frame * 32;
    },
    [activeScene]
  );

  const isFrameSlotOccupied = useCallback(
    (layer: SceneLayer, frameNumber: number) => {
      return layer.frames.some(
        (frame) =>
          frameNumber >= frame.frameNumber &&
          frameNumber < frame.frameNumber + frame.length
      );
    },
    []
  );

  const isFrameSlotPartOfExpandedFrame = useCallback(
    (layer: SceneLayer, frameNumber: number) => {
      return layer.frames.some(
        (frame) =>
          frame.length > 1 &&
          frameNumber > frame.frameNumber &&
          frameNumber < frame.frameNumber + frame.length
      );
    },
    []
  );

  const contextValue = {
    fps,
    duration,
    totalFrames,
    currentFrame,
    isPlaying,
    activeScene,
    handleFrameClick,
    handleDeleteFrame,
    handleResizeFrame,
    getPlayheadPosition,
    isFrameSlotOccupied,
    isFrameSlotPartOfExpandedFrame,
  };

  return (
    <TimelineContext.Provider value={contextValue}>
      <div className="h-64 border-t flex flex-col">
        <PlaybackControls />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Headers Container */}
          <div className="flex shrink-0">
            {/* Layer Header */}
            <div className="w-48 shrink-0 bg-background border-r z-10">
              <div className="h-8 border-b flex items-center justify-between p-2">
                <span className="text-xs font-medium">Layers</span>
                <button
                  onClick={() => {
                    if (!activeScene) return;
                    const newLayer = useSceneStore
                      .getState()
                      .createLayer(activeScene.id, "Untitled", "midground");
                    // Set the new layer as active
                    useLayerPanelStore.getState().setActiveLayerId(newLayer.id);
                  }}
                  className="h-5 w-5 rounded-sm hover:bg-accent flex items-center justify-center"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Frame Headers */}
            <div className="flex-1">
              <TimelineHeader />
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-auto">
            <div
              className="min-w-full"
              style={{ width: `${totalFrames * 32 + 192}px` }}
            >
              {activeScene?.layers.map((layer: SceneLayer) => (
                <div key={layer.id} className="flex">
                  {/* Layer Row */}
                  <div className="w-48 shrink-0 border-r bg-background">
                    <LayerRow layer={layer} />
                  </div>
                  {/* Frame Row */}
                  <div className="flex-1">
                    <FrameGrid layer={layer} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TimelineContext.Provider>
  );
}

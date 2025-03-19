import { cn } from "@/lib/utils";
import { useTimelineContext } from "./context";
import { Frame } from "./frame";
import type { SceneLayer } from "@/lib/store/scene-store";
import { useSceneStore } from "@/lib/store/scene-store";

interface FrameGridProps {
  layer: SceneLayer;
}

export function FrameGrid({ layer }: FrameGridProps) {
  const {
    activeScene,
    totalFrames,
    currentFrame,
    isPlaying,
    handleFrameClick,
    handleDeleteFrame,
    handleResizeFrame,
    getPlayheadPosition,
  } = useTimelineContext();

  if (!activeScene) return null;

  return (
    <div className="flex-1">
      <div className="relative">
        <div
          className={cn(
            "h-7 border-b relative",
            !layer.visible && "opacity-50"
          )}
        >
          {/* Layer Frames */}
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ width: `${totalFrames * 32}px` }}
          >
            {layer.frames.map((frame) => (
              <Frame
                key={`${frame.id}-${layer.id}-${frame.frameNumber}`}
                frame={frame}
                frameNumber={frame.frameNumber}
                isCurrentFrame={
                  currentFrame >= frame.frameNumber &&
                  currentFrame < frame.frameNumber + frame.length
                }
                isPlaying={isPlaying}
                onFrameClick={() =>
                  !isPlaying && handleFrameClick(frame.frameNumber, layer.id)
                }
                onDeleteFrame={() => handleDeleteFrame(frame.id)}
                onDuplicateFrame={() => {
                  if (!activeScene) return;
                  useSceneStore
                    .getState()
                    .duplicateFrame(activeScene.id, frame.frameNumber);
                }}
                onResizeFrame={(newLength, newFrameNumber) =>
                  handleResizeFrame(frame.id, newLength, newFrameNumber)
                }
              />
            ))}

            {/* Empty Frame Slots */}
            {Array.from({ length: totalFrames }).map((_, i) => {
              // Check if this frame slot is occupied in this layer
              const isOccupied = layer.frames.some(
                (f) => i >= f.frameNumber && i < f.frameNumber + f.length
              );

              if (isOccupied) return null;

              return (
                <div
                  key={`${layer.id}-${i}`}
                  className={cn(
                    "absolute top-0 h-full border-r",
                    "transition-colors",
                    "cursor-pointer hover:bg-accent/50",
                    "opacity-80"
                  )}
                  style={{
                    width: "32px",
                    left: `${i * 32}px`,
                  }}
                  onClick={() => handleFrameClick(i, layer.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 w-1 h-full pointer-events-none z-20 bg-red-500/50"
          style={{
            left: `${getPlayheadPosition(currentFrame)}px`,
          }}
        />
      </div>
    </div>
  );
}

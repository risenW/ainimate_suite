import { useEffect, useState, useCallback } from "react";
import { useSceneStore, type LayerFrame } from "@/lib/store/scene-store";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useLayerPanelStore } from "@/lib/store/layer-panel-store";

interface FrameProps {
  frame: LayerFrame | undefined;
  frameNumber: number;
  isCurrentFrame: boolean;
  isPlaying: boolean;
  onFrameClick: () => void;
  onDeleteFrame: () => void;
  onDuplicateFrame: () => void;
  onResizeFrame: (newLength: number, newFrameNumber?: number) => void;
}

export function Frame({
  frame,
  frameNumber,
  isCurrentFrame,
  isPlaying,
  onFrameClick,
  onDeleteFrame,
  onDuplicateFrame,
  onResizeFrame,
}: FrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialLength, setInitialLength] = useState(1);
  const [frameLength, setFrameLength] = useState(frame?.length || 1);
  const [dragPreview, setDragPreview] = useState<{
    edge: "left" | "right";
    length: number;
    frameNumber: number;
  } | null>(null);
  const activeScene = useSceneStore((state) => state.activeScene);

  // Update local length when frame length changes from props
  useEffect(() => {
    if (!isDragging && frame?.length) {
      setFrameLength(frame.length);
      setInitialLength(frame.length);
    }
  }, [frame?.length, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!frame) return;

    // Get the click position relative to the frame
    const rect = e.currentTarget.getBoundingClientRect();
    const rightEdge = rect.right;
    const leftEdge = rect.left;
    const clickX = e.clientX;

    // Check if clicking on either edge (increased contact area)
    const isRightEdge = Math.abs(rightEdge - clickX) < 8;
    const isLeftEdge = frameNumber > 0 && Math.abs(leftEdge - clickX) < 8;

    if (isRightEdge || isLeftEdge) {
      setIsDragging(true);
      setStartX(e.clientX);
      setInitialLength(frame.length || 1);
      setDragPreview({
        edge: isLeftEdge ? "left" : "right",
        length: frame.length || 1,
        frameNumber: frame.frameNumber,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const findNextFrame = useCallback(
    (currentFrameNumber: number) => {
      if (!activeScene) return null;
      const activeLayerId = useLayerPanelStore.getState().activeLayerId;
      if (!activeLayerId) return null;

      const activeLayer = activeScene.layers.find(
        (l) => l.id === activeLayerId
      );
      if (!activeLayer) return null;

      return activeLayer.frames
        .filter((f) => f.frameNumber > currentFrameNumber)
        .sort((a, b) => a.frameNumber - b.frameNumber)[0];
    },
    [activeScene]
  );

  const findPrevFrame = useCallback(
    (currentFrameNumber: number) => {
      if (!activeScene) return null;
      const activeLayerId = useLayerPanelStore.getState().activeLayerId;
      if (!activeLayerId) return null;

      const activeLayer = activeScene.layers.find(
        (l) => l.id === activeLayerId
      );
      if (!activeLayer) return null;

      return activeLayer.frames
        .filter((f) => f.frameNumber < currentFrameNumber)
        .sort((a, b) => b.frameNumber - a.frameNumber)[0];
    },
    [activeScene]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !frame || !dragPreview) return;

      const deltaX = e.clientX - startX;
      const deltaCells = Math.floor(deltaX / 48);

      let newLength = initialLength;
      let newFrameNumber = frame.frameNumber;

      if (dragPreview.edge === "left") {
        // When dragging left edge
        const prevFrame = findPrevFrame(frame.frameNumber);
        const minFrameNumber = prevFrame
          ? prevFrame.frameNumber + prevFrame.length
          : 0;
        const proposedFrameNumber = Math.max(
          minFrameNumber,
          frame.frameNumber + deltaCells
        );

        newFrameNumber = proposedFrameNumber;
        newLength = initialLength - (proposedFrameNumber - frame.frameNumber);
      } else {
        // When dragging right edge
        const nextFrame = findNextFrame(frame.frameNumber);
        const maxLength = nextFrame
          ? nextFrame.frameNumber - frame.frameNumber
          : Math.max(1, initialLength + deltaCells);

        newLength = Math.min(
          maxLength,
          Math.max(1, initialLength + deltaCells)
        );
      }

      setDragPreview({
        ...dragPreview,
        length: newLength,
        frameNumber: newFrameNumber,
      });
    },
    [
      isDragging,
      startX,
      initialLength,
      frame,
      dragPreview,
      findNextFrame,
      findPrevFrame,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragPreview) {
      setIsDragging(false);
      // Apply the final length and position
      onResizeFrame(
        dragPreview.length,
        dragPreview.edge === "left" ? dragPreview.frameNumber : undefined
      );
      setDragPreview(null);
    }
  }, [isDragging, dragPreview, onResizeFrame]);

  // Add drag event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Ensure frameLength stays in sync with frame.length when not dragging
  useEffect(() => {
    if (!isDragging && frame?.length !== frameLength) {
      setFrameLength(frame?.length || 1);
    }
  }, [frame?.length, isDragging, frameLength]);

  if (!frame) {
    // Render empty slot
    return (
      <div
        className={cn(
          "w-12 h-full border-r flex flex-col items-center",
          "cursor-pointer hover:bg-accent/50 transition-colors",
          isCurrentFrame ? "bg-accent shadow-sm" : "",
          isPlaying && "pointer-events-none",
          "opacity-80"
        )}
        onClick={onFrameClick}
      />
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "h-full border-r flex flex-col items-center",
            "cursor-pointer hover:bg-accent/50 transition-colors",
            isCurrentFrame ? "bg-accent shadow-sm" : "",
            isDragging && "cursor-ew-resize opacity-50",
            "absolute top-0",
            "bg-background",
            isPlaying ? "opacity-50" : ""
          )}
          style={{
            width: `${frameLength * 32}px`,
            left: `${frameNumber * 32}px`,
            zIndex: isCurrentFrame ? 30 : 20,
            pointerEvents: isPlaying ? "none" : "auto",
          }}
          onClick={onFrameClick}
          onMouseDown={handleMouseDown}
        >
          {/* Frame Content */}
          <div className="w-full h-full flex flex-col">
            {/* Frame exposure indicator */}
            <div
              className={cn(
                "h-1.5",
                isCurrentFrame ? "bg-primary/30" : "bg-primary/20"
              )}
            >
              {/* Single indicator for expanded frames */}
              <div
                className={cn(
                  "h-full",
                  isCurrentFrame ? "bg-primary/60" : "bg-primary/40"
                )}
                style={{ width: frameLength > 1 ? "100%" : "auto" }}
              />
            </div>

            {/* Frame thumbnail */}
            <div className="flex-1 flex items-center justify-center p-0">
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center",
                  isCurrentFrame ? "bg-primary/30" : "bg-primary/20"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full",
                    isCurrentFrame ? "bg-primary/60" : "bg-primary/40"
                  )}
                />
              </div>
              {frameLength > 1 && (
                <span className="absolute bottom-0.5 right-1 text-xs text-muted-foreground">
                  {frameLength}f
                </span>
              )}
            </div>
          </div>

          {/* Left resize handle - only for non-first frames */}
          {frameNumber > 0 && (
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-0.5 cursor-ew-resize",
                isCurrentFrame
                  ? "bg-primary/30 hover:bg-primary/50"
                  : "bg-primary/20 hover:bg-primary/40"
              )}
            />
          )}

          {/* Right resize handle */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-0.5 cursor-ew-resize",
              isCurrentFrame
                ? "bg-primary/30 hover:bg-primary/50"
                : "bg-primary/20 hover:bg-primary/40"
            )}
          />
        </div>

        {/* Drag Preview */}
        {isDragging && dragPreview && (
          <div
            key={`${frame.id}-preview`}
            className={cn(
              "absolute top-0 h-full border-2 border-blue-500 border-dashed",
              "bg-blue-500/10 pointer-events-none"
            )}
            style={{
              width: `${dragPreview.length * 32}px`,
              left: `${dragPreview.frameNumber * 32}px`,
              zIndex: 40,
            }}
          />
        )}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onDuplicateFrame}>
          <span>Duplicate Frame</span>
          <span className="ml-auto text-xs text-muted-foreground">Alt+D</span>
        </ContextMenuItem>
        <ContextMenuItem className="text-destructive" onClick={onDeleteFrame}>
          Delete Frame
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { CanvasGrid } from "./canvas-grid";
import { useCanvasShortcuts } from "@/hooks/use-canvas-shortcuts";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage as KonvaStage } from "konva/lib/Stage";
import { useCanvasSettingsStore } from "@/lib/store/canvas-settings-store";
import { useSceneStore } from "@/lib/store/scene-store";
import { CanvasToolbar } from "./canvas-toolbar";
import { SceneElement as SceneElementComponent } from "../scene/scene-element";
import { useToolStore } from "@/lib/store/tool-store";
import type { SceneElement, SceneLayer, Scene } from "@/lib/store/scene-store";
import { LAYOUT } from "@/lib/constants/layout";
import { useProjectStore } from "@/lib/store/project-store";
import { useLayerPanelStore } from "@/lib/store/layer-panel-store";

function OnionSkinLayers() {
  const activeScene = useSceneStore((state) => state.activeScene);
  const currentFrame = useSceneStore((state) => state.currentFrame);
  const onionSkinning = useSceneStore((state) => state.onionSkinning);

  if (!activeScene || !onionSkinning.enabled) return null;

  const getFrameElements = (frameNumber: number) => {
    // Get frames from each layer at the specified frame number
    const layerFrames = activeScene.layers
      .map((layer) => {
        const frame = layer.frames.find((f) => f.frameNumber === frameNumber);
        return frame?.elements || [];
      })
      .flat();

    // Group elements by layer type
    const elementsByLayer = layerFrames.reduce(
      (acc: Record<SceneLayer["type"], SceneElement[]>, element) => {
        const layerType = element.layerType || "midground";
        if (!acc[layerType]) acc[layerType] = [];
        acc[layerType].push(element);
        return acc;
      },
      {} as Record<SceneLayer["type"], SceneElement[]>
    );

    // Return elements in layer order
    return activeScene.layers.flatMap(
      (layer) => elementsByLayer[layer.type] || []
    );
  };

  // Get previous and next frames
  const allFrameNumbers = activeScene.layers
    .flatMap((layer) => layer.frames.map((f) => f.frameNumber))
    .sort((a, b) => a - b);

  const prevFrames = Array.from(
    { length: onionSkinning.prevFrames },
    (_, i) => currentFrame - (i + 1)
  ).filter((f) => f >= 0 && allFrameNumbers.includes(f));

  const nextFrames = Array.from(
    { length: onionSkinning.nextFrames },
    (_, i) => currentFrame + (i + 1)
  ).filter((f) => allFrameNumbers.includes(f));

  return (
    <>
      {/* Previous Frames - Custom Color */}
      {prevFrames.map((frameNumber) => (
        <Layer key={`prev-${frameNumber}`} opacity={onionSkinning.opacity}>
          {getFrameElements(frameNumber).map((element) => (
            <SceneElementComponent
              key={element.id}
              element={{
                ...element,
                properties: {
                  ...element.properties,
                  fill:
                    element.type !== "drawing"
                      ? onionSkinning.prevColor
                      : element.properties.fill,
                  stroke:
                    element.type === "drawing"
                      ? onionSkinning.prevColor
                      : element.properties.stroke,
                },
              }}
              isLocked={true}
              onDragEnd={() => {}}
            />
          ))}
        </Layer>
      ))}

      {/* Next Frames - Custom Color */}
      {nextFrames.map((frameNumber) => (
        <Layer key={`next-${frameNumber}`} opacity={onionSkinning.opacity}>
          {getFrameElements(frameNumber).map((element) => (
            <SceneElementComponent
              key={element.id}
              element={{
                ...element,
                properties: {
                  ...element.properties,
                  fill:
                    element.type !== "drawing"
                      ? onionSkinning.nextColor
                      : element.properties.fill,
                  stroke:
                    element.type === "drawing"
                      ? onionSkinning.nextColor
                      : element.properties.stroke,
                },
              }}
              isLocked={true}
              onDragEnd={() => {}}
            />
          ))}
        </Layer>
      ))}
    </>
  );
}

export default function AnimatorCanvas({
  activeScene,
}: {
  activeScene: Scene | null;
}) {
  const stageRef = useRef<KonvaStage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasStore = useCanvasStore();
  const { settings } = useCanvasSettingsStore();
  const currentProject = useProjectStore((state) => state.currentProject);
  const setSelectedElement = useSceneStore((state) => state.setSelectedElement);
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  const [isDragging, setIsDragging] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[] | null>(null);
  const isDrawing = useRef(false);
  const activeLayerId = useLayerPanelStore((state) => state.activeLayerId);

  // Find the active layer using the selected layer ID
  const activeLayer = activeScene?.layers.find(
    (l) => l.id === activeLayerId && !l.locked && l.visible
  );

  const handleAutoFit = useCallback(() => {
    if (!activeScene || !containerRef.current || !currentProject) return;

    const canvasWidth = currentProject.settings.width;
    const canvasHeight = currentProject.settings.height;

    // Get container dimensions
    const containerWidth =
      containerRef.current.clientWidth - (settings.rulers ? 40 : 0);
    const containerHeight =
      containerRef.current.clientHeight - (settings.rulers ? 40 : 0);

    // Calculate zoom to fit
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const newZoom = Math.min(scaleX, scaleY);

    // Calculate position to center
    const centerX =
      (containerWidth - canvasWidth * newZoom) / 2 + (settings.rulers ? 20 : 0);
    const centerY =
      (containerHeight - canvasHeight * newZoom) / 2 +
      (settings.rulers ? 20 : 0);

    // Only update if values have changed
    if (
      newZoom !== canvasStore.zoom ||
      centerX !== canvasStore.position.x ||
      centerY !== canvasStore.position.y
    ) {
      canvasStore.setZoom(newZoom);
      canvasStore.setPosition({ x: centerX, y: centerY });
    }
  }, [activeScene, settings, currentProject, canvasStore]);

  // Effect to set stage ref
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.x(canvasStore.position.x);
      stageRef.current.y(canvasStore.position.y);
      stageRef.current.scaleX(canvasStore.zoom);
      stageRef.current.scaleY(canvasStore.zoom);
    }
  }, [canvasStore.position, canvasStore.zoom]);

  // Effect to calculate and set initial zoom
  useEffect(() => {
    const timer = setTimeout(handleAutoFit, 0);
    return () => clearTimeout(timer);
  }, [handleAutoFit]);

  // Add resize observer to update stage dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      handleAutoFit();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleAutoFit]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    const newScale2 = Math.max(
      LAYOUT.CANVAS.MIN_ZOOM,
      Math.min(newScale, LAYOUT.CANVAS.MAX_ZOOM)
    );

    canvasStore.setPosition({
      x: pointer.x - mousePointTo.x * newScale2,
      y: pointer.y - mousePointTo.y * newScale2,
    });
    canvasStore.setZoom(newScale2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!activeScene || !activeLayer) return;

    const dropData = JSON.parse(e.dataTransfer.getData("application/json"));
    if (!dropData) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Get drop position relative to container
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to stage accounting for scroll, zoom, and stage position
    const x =
      (e.clientX - containerRect.left - stage.x()) / stage.scaleX() -
      (settings.rulers ? 20 : 0);
    const y =
      (e.clientY - containerRect.top - stage.y()) / stage.scaleY() -
      (settings.rulers ? 20 : 0);

    // Create new element
    const newElement: Omit<SceneElement, "id"> = {
      type: dropData.type,
      layerType: activeLayer.type,
      position: { x, y },
      rotation: 0,
      scale: { x: 1, y: 1 },
      properties: {
        ...dropData.properties,
        shapeType: dropData.shapeType,
      },
    };

    // Add the element
    useSceneStore
      .getState()
      .addElement(activeScene.id, activeLayer.id, newElement);

    // Get the latest scene state
    const updatedScene = useSceneStore.getState().activeScene;
    if (updatedScene) {
      const layer = updatedScene.layers.find((l) => l.id === activeLayer.id);
      if (layer) {
        const lastElement = layer.elements[layer.elements.length - 1];
        if (lastElement) {
          setSelectedElement(lastElement);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Update cursor style based on drawing mode
  const getCursor = () => {
    if (canvasStore.panEnabled) {
      return isDragging ? "grabbing" : "grab";
    }
    if (activeTool === "brush") {
      // Create a circular cursor for brush
      const size = 16; // Size of the circle cursor
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
        ctx.strokeStyle = "black";
        ctx.stroke();
      }
      return `url(${canvas.toDataURL()}) ${size / 2} ${size / 2}, crosshair`;
    }
    if (activeTool === "pencil") {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z'/%3E%3C/svg%3E\") 0 24, crosshair";
    }
    if (activeTool === "text") {
      return "text";
    }
    return "default";
  };

  const handleStageInteraction = (
    e: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!activeScene) return;

    if (activeTool === "select") {
      handleStageMouseDown(e);
    } else if (activeTool === "pencil" || activeTool === "brush") {
      handleStageMouseDown(e);
    } else if (activeTool === "text" && activeLayer) {
      handleTextInteraction(e, activeLayer.id);
    }
  };

  const handleTextInteraction = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
    layerId: string
  ) => {
    if (!activeScene) return;

    // Get the target element and check if it's a Konva.Stage or the grid
    const target = e.target;
    const isStage = target === target.getStage();
    const isGrid = target.name() === "canvas-grid";

    // Only proceed if we clicked on the stage or grid
    if (!isStage && !isGrid) return;

    const stage = target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = (pos.x - stage.x()) / stage.scaleX();
    const y = (pos.y - stage.y()) / stage.scaleY();

    if (activeTool === "text") {
      const layer = activeScene.layers.find((l) => l.id === layerId);
      if (!layer) return;

      const newText: Omit<SceneElement, "id"> = {
        type: "text",
        layerType: layer.type,
        position: { x, y },
        rotation: 0,
        scale: { x: 1, y: 1 },
        properties: {
          shapeType: "text",
          text: "Text",
          fontSize: 24,
          fill: "#000000",
          width: 200,
          height: 50,
        },
      };
      useSceneStore.getState().addElement(activeScene.id, layerId, newText);

      // Get the latest scene state and select the new text element
      const updatedScene = useSceneStore.getState().activeScene;
      if (updatedScene) {
        const layer = updatedScene.layers.find((l) => l.id === layerId);
        if (layer) {
          const lastElement = layer.elements[layer.elements.length - 1];
          if (lastElement) {
            setSelectedElement(lastElement);
            // Switch to select tool after adding text
            setActiveTool("select");
          }
        }
      }
    }
  };

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      // Get the target element and check if it's a Konva.Stage or grid
      const target = e.target;
      const isStage = target === target.getStage();
      const isGrid = target.name() === "canvas-grid";

      // Only handle stage or grid clicks, not shape clicks
      if (!isStage && !isGrid) return;

      const stage = target.getStage();
      if (!stage || !activeScene) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Convert position to account for stage scale and position
      const x = (pos.x - stage.x()) / stage.scaleX();
      const y = (pos.y - stage.y()) / stage.scaleY();

      if (activeTool === "pencil" || activeTool === "brush") {
        // Only prevent default for drawing
        e.evt.preventDefault();
        isDrawing.current = true;
        setCurrentLine([x, y]);
        return;
      }

      // Handle click on empty canvas for select tool
      setSelectedElement(null);
    },
    [activeTool, activeScene, setSelectedElement]
  );

  const handleStageMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (
        !isDrawing.current ||
        !currentLine ||
        (activeTool !== "pencil" && activeTool !== "brush")
      )
        return;

      // Only prevent default for drawing
      e.evt.preventDefault();

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Convert position to account for stage scale and position
      const x = (pos.x - stage.x()) / stage.scaleX();
      const y = (pos.y - stage.y()) / stage.scaleY();

      setCurrentLine([...currentLine, x, y]);
    },
    [currentLine, activeTool]
  );

  const handleStageMouseUp = useCallback(() => {
    if (!activeScene || !activeLayer) return;
    isDrawing.current = false;

    if (!currentLine) return;

    // Create new line element
    const newLine: Omit<SceneElement, "id"> = {
      type: "drawing",
      layerType: activeLayer.type,
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      properties: {
        points: currentLine,
        stroke: "#000000",
        strokeWidth: activeTool === "brush" ? 16 : 2,
        tension: activeTool === "brush" ? 0.3 : 0.5,
        lineCap: "round",
        lineJoin: "round",
        opacity: activeTool === "brush" ? 0.8 : 1,
      },
    };

    // Add the element
    useSceneStore
      .getState()
      .addElement(activeScene.id, activeLayer.id, newLine);

    // Get the latest scene state
    const updatedScene = useSceneStore.getState().activeScene;
    if (updatedScene) {
      const layer = updatedScene.layers.find((l) => l.id === activeLayer.id);
      if (layer) {
        const lastElement = layer.elements[layer.elements.length - 1];
        if (lastElement) {
          setSelectedElement(lastElement);
        }
      }
    }

    setCurrentLine(null);
  }, [activeScene, activeLayer, currentLine, setSelectedElement, activeTool]);

  useCanvasShortcuts();

  if (!activeScene) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-100 dark:bg-muted relative overflow-hidden border-2"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ cursor: getCursor() }}
    >
      <CanvasToolbar onAutoFit={handleAutoFit} />
      <Stage
        ref={stageRef}
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 600}
        scaleX={canvasStore.zoom}
        scaleY={canvasStore.zoom}
        x={canvasStore.position.x}
        y={canvasStore.position.y}
        draggable={
          canvasStore.panEnabled &&
          activeTool !== "pencil" &&
          activeTool !== "brush"
        }
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onWheel={handleWheel}
        onMouseDown={handleStageInteraction}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchStart={handleStageInteraction}
        onTouchMove={handleStageMouseMove}
        onTouchEnd={handleStageMouseUp}
        style={{
          margin: settings.rulers ? "20px 0 0 20px" : "0",
        }}
        listening={true}
      >
        {/* Background Layer */}
        <Layer>
          <CanvasGrid />
        </Layer>

        {/* Onion Skin Layers */}
        <OnionSkinLayers />

        {/* Scene Layers */}
        {activeScene &&
          activeScene.layers
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((layer) => (
              <Layer
                key={layer.id}
                visible={layer.visible}
                opacity={layer.opacity}
              >
                {/* Current drawing line */}
                {currentLine && (
                  <Line
                    points={currentLine}
                    stroke="#000000"
                    strokeWidth={activeTool === "brush" ? 16 : 2}
                    tension={activeTool === "brush" ? 0.3 : 0.5}
                    lineCap="round"
                    lineJoin="round"
                    perfectDrawEnabled={false}
                    shadowForStrokeEnabled={false}
                    globalCompositeOperation="source-over"
                    opacity={activeTool === "brush" ? 0.8 : 1}
                    listening={true}
                    hitStrokeWidth={activeTool === "select" ? 30 : 0}
                  />
                )}
                {layer.elements.map((element) => (
                  <SceneElementComponent
                    key={element.id}
                    element={element}
                    isLocked={layer.locked}
                    onDragEnd={(e) => {
                      if (layer.locked) return;
                      const position = {
                        x: e.target.x(),
                        y: e.target.y(),
                      };
                      useSceneStore
                        .getState()
                        .updateElement(activeScene.id, layer.id, element.id, {
                          position,
                        });
                    }}
                  />
                ))}
              </Layer>
            ))}
      </Stage>
    </div>
  );
}

"use client";

import {
  Rect,
  Text,
  Transformer,
  Circle,
  Line,
  RegularPolygon,
  Star as KonvaStar,
  Arc,
  Ring,
} from "react-konva";
import { useEffect, useRef, useCallback } from "react";
import { useSceneStore } from "@/lib/store/scene-store";
import { KonvaEventObject } from "konva/lib/Node";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import type { SceneElement as SceneElementType } from "@/lib/store/scene-store";
import Konva from "konva";
import { useToolStore } from "@/lib/store/tool-store";
import { useCanvasSettingsStore } from "@/lib/store/canvas-settings-store";

interface SceneElementProps {
  element: SceneElementType;
  isLocked: boolean;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
}

export function SceneElement({
  element,
  isLocked,
  onDragEnd,
}: SceneElementProps) {
  const isSelected = useSceneStore(
    (state) => state.selectedElement?.id === element.id
  );
  const setSelectedElement = useSceneStore((state) => state.setSelectedElement);
  const activeScene = useSceneStore((state) => state.activeScene);
  const { updateElement, removeElement } = useSceneStore();
  const { settings } = useCanvasSettingsStore();
  const rectRef = useRef<Konva.Rect>(null);
  const circleRef = useRef<Konva.Circle>(null);
  const lineRef = useRef<Konva.Line>(null);
  const polygonRef = useRef<Konva.RegularPolygon>(null);
  const starRef = useRef<Konva.Star>(null);
  const arcRef = useRef<Konva.Arc>(null);
  const ringRef = useRef<Konva.Ring>(null);
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<TransformerType>(null);
  const activeTool = useToolStore((state) => state.activeTool);
  const isPlaying = useSceneStore((state) => state.isPlaying);

  useEffect(() => {
    const activeRef =
      rectRef.current ||
      circleRef.current ||
      lineRef.current ||
      polygonRef.current ||
      starRef.current ||
      arcRef.current ||
      ringRef.current ||
      textRef.current;

    if (isSelected && transformerRef.current && activeRef) {
      transformerRef.current.nodes([activeRef]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleSelect = (e: KonvaEventObject<MouseEvent>) => {
    // Stop event from bubbling to stage
    e.cancelBubble = true;

    // Disable selection during playback
    if (isPlaying) return;

    if (activeTool === "select") {
      setSelectedElement(isSelected ? null : element);
    }
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    if (!activeScene) return;

    // Cast node to appropriate type
    const node = e.target as Konva.Shape;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Reset the scale to 1
    node.scaleX(1);
    node.scaleY(1);

    let updates: Partial<SceneElementType> = {
      rotation,
      position: { x: node.x(), y: node.y() },
    };

    if (element.type === "drawing") {
      updates = {
        ...updates,
        scale: { x: scaleX, y: scaleY },
        properties: {
          ...element.properties,
        },
      };
    } else if (element.type === "text") {
      // For text elements, scale affects the font size
      const newFontSize = Math.max(
        5,
        (element.properties.fontSize as number) * scaleX
      );
      const textNode = textRef.current;

      updates.properties = {
        ...element.properties,
        fontSize: Math.round(newFontSize),
        width: textNode?.width() || element.properties.width,
        height: textNode?.height() || element.properties.height,
      };
    } else {
      const shapeType = element.properties.shapeType as string;

      // Handle different shape types
      switch (shapeType) {
        case "rectangle":
          const width = Math.max(5, node.width() * scaleX);
          const height = Math.max(node.height() * scaleY);
          updates.properties = {
            ...element.properties,
            width,
            height,
          };
          break;

        case "circle":
        case "ellipse":
          const circle = node as Konva.Circle;
          const radius = Math.max(circle.radius() * scaleX, 5);
          updates.properties = {
            ...element.properties,
            width: radius * 2,
            height: radius * 2,
          };
          break;

        case "line":
        case "arrow":
        case "spline":
          const lineWidth = Math.max(
            (element.properties.width as number) * scaleX,
            5
          );
          updates.properties = {
            ...element.properties,
            width: lineWidth,
          };
          break;

        case "triangle":
        case "hexagon":
          const polygon = node as Konva.RegularPolygon;
          const newRadius = Math.max(polygon.radius() * scaleX, 5);
          updates.properties = {
            ...element.properties,
            width: newRadius * 2,
            height: newRadius * 2,
          };
          break;

        case "star":
          const star = node as Konva.Star;
          const outerRadius = Math.max(star.outerRadius() * scaleX, 5);
          updates.properties = {
            ...element.properties,
            width: outerRadius * 2,
            height: outerRadius * 2,
          };
          break;

        case "arc":
        case "wedge":
          const arc = node as Konva.Arc;
          const arcRadius = Math.max(arc.outerRadius() * scaleX, 5);
          updates.properties = {
            ...element.properties,
            width: arcRadius * 2,
            height: arcRadius * 2,
          };
          break;

        case "ring":
          const ring = node as Konva.Ring;
          const ringRadius = Math.max(ring.outerRadius() * scaleX, 5);
          updates.properties = {
            ...element.properties,
            width: ringRadius * 2,
            height: ringRadius * 2,
          };
          break;

        default:
          updates.properties = element.properties;
      }
    }

    // Update the element
    const layer = activeScene.layers.find((l) =>
      l.elements.find((e) => e.id === element.id)
    );
    if (!layer) return;
    updateElement(activeScene.id, layer.id, element.id, updates);

    // Update the selected element to reflect the new properties
    const updatedElement = {
      ...element,
      ...updates,
    };
    setSelectedElement(updatedElement);
  };

  const handleDelete = useCallback(() => {
    if (!activeScene || isLocked) return;

    const layer = activeScene.layers.find((l) =>
      l.elements.find((e) => e.id === element.id)
    );
    if (!layer) return;

    // First clear selection
    setSelectedElement(null);
    // Then remove element
    removeElement(activeScene.id, layer.id, element.id);
  }, [activeScene, isLocked, element.id, removeElement, setSelectedElement]);

  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, activeScene?.id, element.id, activeTool, handleDelete]);

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (!settings.snapToGrid) return;

    const node = e.target;
    const { gridSize } = settings;

    // Snap position to nearest grid point
    const newX = Math.round(node.x() / gridSize) * gridSize;
    const newY = Math.round(node.y() / gridSize) * gridSize;

    node.position({ x: newX, y: newY });
  };

  const renderElement = () => {
    const commonProps = {
      x: element.position.x,
      y: element.position.y,
      rotation: element.rotation,
      scaleX: element.scale.x,
      scaleY: element.scale.y,
      fill: element.properties.fill as string,
      draggable: !isLocked && !isPlaying && activeTool === "select",
      onClick: handleSelect,
      onTap: handleSelect,
      onDragEnd: onDragEnd,
      onDragMove: handleDragMove,
      onTransformEnd: handleTransformEnd,
    };

    if (element.type === "drawing") {
      return (
        <Line
          {...commonProps}
          points={element.properties.points as number[]}
          stroke={element.properties.stroke as string}
          strokeWidth={element.properties.strokeWidth as number}
          tension={element.properties.tension as number}
          lineCap={(element.properties.lineCap as CanvasLineCap) || "round"}
          lineJoin={(element.properties.lineJoin as CanvasLineJoin) || "round"}
          x={element.position.x}
          y={element.position.y}
          rotation={element.rotation}
          scaleX={element.scale.x}
          scaleY={element.scale.y}
          draggable={!isLocked && !isPlaying && activeTool === "select"}
          onClick={handleSelect}
          onTap={handleSelect}
          onDragEnd={onDragEnd}
          onDragMove={handleDragMove}
          onTransformEnd={handleTransformEnd}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={activeTool === "select" ? 30 : 0}
          ref={lineRef}
        />
      );
    }

    const shapeType = element.properties.shapeType as string;
    const width = element.properties.width as number;
    const height = element.properties.height as number;

    switch (shapeType) {
      case "rectangle":
        return (
          <Rect ref={rectRef} width={width} height={height} {...commonProps} />
        );
      case "circle":
      case "ellipse":
        return <Circle {...commonProps} ref={circleRef} radius={width / 2} />;
      case "line":
        const length = element.properties.width as number;
        return (
          <Line
            {...commonProps}
            ref={lineRef}
            points={[0, 0, 0, length]}
            stroke={
              element.properties.stroke || (element.properties.fill as string)
            }
            strokeWidth={element.properties.strokeWidth || 2}
          />
        );
      case "arrow":
        return (
          <Line
            {...commonProps}
            ref={lineRef}
            points={[0, 0, width, 0]}
            stroke={element.properties.fill as string}
            strokeWidth={2}
            pointerLength={10}
            pointerWidth={10}
            pointerAtBeginning={false}
            pointerAtEnding={true}
          />
        );
      case "triangle":
        return (
          <RegularPolygon
            {...commonProps}
            ref={polygonRef}
            sides={3}
            radius={width / 2}
          />
        );
      case "hexagon":
        return (
          <RegularPolygon
            {...commonProps}
            ref={polygonRef}
            sides={6}
            radius={width / 2}
          />
        );
      case "star":
        return (
          <KonvaStar
            {...commonProps}
            ref={starRef}
            numPoints={5}
            innerRadius={width / 4}
            outerRadius={width / 2}
          />
        );
      case "arc":
        return (
          <Arc
            {...commonProps}
            ref={arcRef}
            angle={180}
            innerRadius={0}
            outerRadius={width / 2}
          />
        );
      case "ring":
        return (
          <Ring
            {...commonProps}
            ref={ringRef}
            innerRadius={width / 4}
            outerRadius={width / 2}
          />
        );
      case "spline":
        return (
          <Line
            {...commonProps}
            ref={lineRef}
            points={[0, 0, width / 2, -height / 2, width, 0]}
            stroke={element.properties.fill as string}
            strokeWidth={2}
            tension={0.5}
          />
        );
      case "wedge":
        return (
          <Arc
            {...commonProps}
            ref={arcRef}
            angle={60}
            innerRadius={0}
            outerRadius={width / 2}
          />
        );
      case "text":
        return (
          <Text
            {...commonProps}
            ref={textRef}
            text={element.properties.text as string}
            fontSize={element.properties.fontSize as number}
            visible={true}
          />
        );
      default:
        console.warn("Unsupported shape type:", shapeType);
        return (
          <Rect {...commonProps} ref={rectRef} width={width} height={height} />
        );
    }
  };

  return (
    <>
      {renderElement()}
      {isSelected && !isLocked && !isPlaying && activeTool === "select" && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            const minSize = 5;
            if (newBox.width < minSize || newBox.height < minSize) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={
            element.type === "drawing"
              ? ["middle-left", "middle-right", "top-center", "bottom-center"]
              : ["top-left", "top-right", "bottom-left", "bottom-right"]
          }
          padding={5}
          ignoreStroke={false}
          keepRatio={element.type === "drawing"}
          centeredScaling={element.type === "drawing"}
        />
      )}
    </>
  );
}

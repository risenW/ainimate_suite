"use client";

import { Line, Rect, Group, Text } from "react-konva";
import { useProjectStore } from "@/lib/store/project-store";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { useCanvasSettingsStore } from "@/lib/store/canvas-settings-store";

export function CanvasGrid() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const { zoom } = useCanvasStore();
  const { settings } = useCanvasSettingsStore();

  if (!currentProject) return null;

  const { width, height } = currentProject.settings;
  const { gridSize, showGrid, safeArea, rulers } = settings;
  const lines = [];

  // Grid lines
  if (showGrid) {
    for (let i = 0; i <= width; i += gridSize) {
      const isMajor = i % (gridSize * 5) === 0;
      lines.push(
        <Line
          key={`v${i}`}
          points={[i, 0, i, height]}
          stroke={isMajor ? "#3A3A3A" : "#2C2C2C"}
          strokeWidth={1 / zoom}
          opacity={isMajor ? 0.4 : 0.2}
        />
      );
    }

    for (let i = 0; i <= height; i += gridSize) {
      const isMajor = i % (gridSize * 5) === 0;
      lines.push(
        <Line
          key={`h${i}`}
          points={[0, i, width, i]}
          stroke={isMajor ? "#3A3A3A" : "#2C2C2C"}
          strokeWidth={1 / zoom}
          opacity={isMajor ? 0.4 : 0.2}
        />
      );
    }
  }

  // Safe area (10% margin)
  const safeAreaMargin = {
    x: width * 0.1,
    y: height * 0.1,
  };

  return (
    <Group>
      {/* Background */}
      <Rect
        width={width}
        height={height}
        fill={settings.backgroundColor}
        name="canvas-grid"
      />

      {/* Grid */}
      {lines}

      {/* Safe Area */}
      {safeArea && (
        <Rect
          x={safeAreaMargin.x}
          y={safeAreaMargin.y}
          width={width - safeAreaMargin.x * 2}
          height={height - safeAreaMargin.y * 2}
          stroke="#666"
          strokeWidth={1 / zoom}
          dash={[4 / zoom]}
        />
      )}

      {/* Rulers */}
      {rulers && (
        <>
          {/* Horizontal Ruler */}
          <Rect y={-20} width={width} height={20} fill="#1A1A1A" />
          {/* Vertical Ruler */}
          <Rect x={-20} width={20} height={height} fill="#1A1A1A" />
          {/* Ruler Markings */}
          {Array.from({ length: Math.ceil(width / 100) }).map((_, i) => (
            <Group key={`ruler-${i}`}>
              <Line
                points={[i * 100, -20, i * 100, -15]}
                stroke="#666"
                strokeWidth={1 / zoom}
              />
              <Text
                x={i * 100 + 2}
                y={-15}
                text={`${i * 100}`}
                fontSize={10 / zoom}
                fill="#666"
              />
            </Group>
          ))}
        </>
      )}
    </Group>
  );
}

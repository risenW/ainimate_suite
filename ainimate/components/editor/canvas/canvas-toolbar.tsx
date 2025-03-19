"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Square,
  Circle,
  Type,
  Pencil,
  Shapes,
  Triangle,
  Hexagon,
  Star,
  RectangleHorizontal,
  MousePointer,
  CircleDot,
  ArrowRight,
  Disc,
  MinusSquare,
  Waves,
  PieChart,
  Plus,
  Minus,
  Move,
  LucideIcon,
  Maximize2,
  Brush,
} from "lucide-react";
import { ToolbarButton } from "./toolbar-button";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { useToolStore } from "@/lib/store/tool-store";
import { cn } from "@/lib/utils";
import { LAYOUT } from "@/lib/constants/layout";

// Define types locally until we set up the types file
type ShapeType =
  | "rectangle"
  | "circle"
  | "ellipse"
  | "line"
  | "arrow"
  | "triangle"
  | "hexagon"
  | "star"
  | "arc"
  | "ring"
  | "spline"
  | "wedge";

enum ToolMode {
  SELECT = "select",
  PENCIL = "pencil",
  BRUSH = "brush",
  TEXT = "text",
  SHAPE = "shape",
}

interface ToolItem {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  shapeType?: ShapeType;
}

interface ToolGroupSection {
  group: string;
  items: ToolItem[];
}

// Add new interface for drag data
interface ShapeDragData {
  type: string;
  shapeType: ShapeType;
  properties: {
    width: number;
    height: number;
    fill: string;
  };
}

interface ToolGroup {
  id: string;
  icon: LucideIcon;
  label: string;
  tools: ToolGroupSection[];
  onClick?: () => void;
  isActive?: boolean;
}

interface CanvasToolbarProps {
  onAutoFit: () => void;
}

export function CanvasToolbar({ onAutoFit }: CanvasToolbarProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<ToolMode | null>(
    ToolMode.SELECT
  );
  const { zoom, setZoom, panEnabled, setPanEnabled } = useCanvasStore();
  const { setActiveTool } = useToolStore();

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setActiveGroup(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleZoomIn = () =>
    setZoom(Math.min(zoom * 1.2, LAYOUT.CANVAS.MAX_ZOOM));
  const handleZoomOut = () =>
    setZoom(Math.max(zoom / 1.2, LAYOUT.CANVAS.MIN_ZOOM));

  const toolGroups: ToolGroup[] = [
    {
      id: ToolMode.SELECT,
      icon: MousePointer,
      label: "Select",
      onClick: () => {
        setSelectedTool(ToolMode.SELECT);
        setActiveTool("select");
        setActiveGroup(null);
      },
      tools: [],
      isActive: selectedTool === ToolMode.SELECT,
    },
    {
      id: "pan",
      icon: Move,
      label: "Pan Canvas",
      onClick: () => setPanEnabled(!panEnabled),
      isActive: panEnabled,
      tools: [],
    },
    {
      id: ToolMode.PENCIL,
      icon: Pencil,
      label: "Pencil",
      onClick: () => {
        setSelectedTool(ToolMode.PENCIL);
        setActiveTool("pencil");
        setActiveGroup(null);
      },
      tools: [],
      isActive: selectedTool === ToolMode.PENCIL,
    },
    {
      id: ToolMode.BRUSH,
      icon: Brush,
      label: "Brush",
      onClick: () => {
        setSelectedTool(ToolMode.BRUSH);
        setActiveTool("brush");
        setActiveGroup(null);
      },
      tools: [],
      isActive: selectedTool === ToolMode.BRUSH,
    },
    {
      id: ToolMode.SHAPE,
      icon: Shapes,
      label: "Shapes",
      tools: [
        {
          group: "Basic Shapes",
          items: [
            {
              id: "rectangle",
              icon: Square,
              label: "Square",
              shapeType: "rectangle",
            },
            {
              id: "rectangle-h",
              icon: RectangleHorizontal,
              label: "Rectangle",
              shapeType: "rectangle",
            },
            {
              id: "circle",
              icon: Circle,
              label: "Circle",
              shapeType: "circle",
            },
            {
              id: "ellipse",
              icon: Circle,
              label: "Ellipse",
              shapeType: "ellipse",
            },
            {
              id: "arc",
              icon: Disc,
              label: "Arc",
              shapeType: "arc",
            },
            {
              id: "ring",
              icon: CircleDot,
              label: "Ring",
              shapeType: "ring",
            },
          ],
        },
        {
          group: "Lines & Arrows",
          items: [
            {
              id: "line",
              icon: MinusSquare,
              label: "Line",
              shapeType: "line",
            },
            {
              id: "arrow",
              icon: ArrowRight,
              label: "Arrow",
              shapeType: "arrow",
            },
            {
              id: "spline",
              icon: Waves,
              label: "Spline",
              shapeType: "spline",
            },
          ],
        },
        {
          group: "Geometric",
          items: [
            {
              id: "triangle",
              icon: Triangle,
              label: "Triangle",
              shapeType: "triangle",
            },
            {
              id: "hexagon",
              icon: Hexagon,
              label: "Hexagon",
              shapeType: "hexagon",
            },
            {
              id: "star",
              icon: Star,
              label: "Star",
              shapeType: "star",
            },
            {
              id: "wedge",
              icon: PieChart,
              label: "Wedge",
              shapeType: "wedge",
            },
          ],
        },
      ],
      isActive:
        selectedTool === ToolMode.SHAPE || activeGroup === ToolMode.SHAPE,
    },
    {
      id: ToolMode.TEXT,
      icon: Type,
      label: "Text",
      onClick: () => {
        setSelectedTool(ToolMode.TEXT);
        setActiveTool("text");
        setActiveGroup(null);
      },
      tools: [],
      isActive: selectedTool === ToolMode.TEXT,
    },
  ];

  const handleToolSelect = (tool: ToolItem) => {
    if (tool.disabled) return;

    // Only handle non-shape tools on click (like pen, text, etc)
    if (!tool.shapeType && tool.onClick) {
      tool.onClick();
    }

    // Close the submenu after selection
    setActiveGroup(null);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        ref={toolbarRef}
        className={cn(
          "absolute left-1 top-6 flex flex-col gap-1 bg-background border rounded-lg shadow-md",
          `w-[${LAYOUT.TOOLBAR.WIDTH}px] p-${LAYOUT.TOOLBAR.PADDING} z-30`
        )}
      >
        {/* Main Tools */}
        <div className="flex flex-col gap-1">
          {toolGroups.map((group) => (
            <div key={group.id} className="relative">
              <ToolbarButton
                icon={group.icon}
                label={group.label}
                onClick={() => {
                  if (group.onClick) {
                    group.onClick();
                  } else {
                    setActiveGroup(activeGroup === group.id ? null : group.id);
                    setSelectedTool(group.id as ToolMode);
                  }
                }}
                isActive={group.isActive}
              />
              {activeGroup === group.id && group.tools.length > 0 && (
                <ToolbarSubmenu
                  tools={group.tools}
                  activeToolId={selectedTool || ""}
                  onSelectTool={handleToolSelect}
                />
              )}
            </div>
          ))}
        </div>

        {/* Pan and Zoom Controls */}
        <div className="mt-auto pt-1 border-t flex flex-col gap-1">
          <ToolbarButton
            icon={Plus}
            label="Zoom In (+)"
            onClick={handleZoomIn}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 min-w-[49px] h-8"
            onClick={onAutoFit}
          >
            {Math.round(zoom * 100)}%
          </Button>
          <ToolbarButton
            icon={Minus}
            label="Zoom Out (-)"
            onClick={handleZoomOut}
          />
          <ToolbarButton
            icon={Maximize2}
            label="Fit to Screen (0)"
            onClick={onAutoFit}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

interface ToolbarSubmenuProps {
  tools: ToolGroupSection[];
  activeToolId: string;
  onSelectTool: (tool: ToolItem) => void;
}

function ToolbarSubmenu({
  tools,
  activeToolId,
  onSelectTool,
}: ToolbarSubmenuProps) {
  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    tool: ToolItem
  ) => {
    if (tool.disabled || !tool.shapeType) return;

    const dragData: ShapeDragData = {
      type: "shape",
      shapeType: tool.shapeType,
      properties: {
        width: 100,
        height: 100,
        fill: "#4B5563",
      },
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="absolute left-full top-0 ml-1 bg-background border rounded-lg shadow-md p-2 w-[250px]">
      {tools.map((section, index) => (
        <div key={section.group} className={cn(index > 0 && "mt-2")}>
          <div className="text-xs text-muted-foreground px-2 py-1">
            {section.group}
          </div>
          <div className="space-y-1 grid grid-cols-2">
            {section.items.map((tool) => (
              <Button
                key={tool.id}
                variant={activeToolId === tool.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  tool.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => onSelectTool(tool)}
                draggable={!tool.disabled && !!tool.shapeType}
                onDragStart={(e) => handleDragStart(e, tool)}
              >
                <tool.icon className="h-4 w-4" />
                <span className="text-sm">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

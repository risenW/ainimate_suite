"use client";

import { useSceneStore } from "@/lib/store/scene-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useState, useEffect } from "react";
import debounce from "lodash/debounce";

interface ElementUpdate {
  properties?: Record<string, unknown>;
  rotation?: number;
  scale?: { x: number; y: number };
}

interface InputValues {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  rotation?: number;
  strokeWidth?: number;
  cornerRadius?: number;
  innerRadius?: number;
  outerRadius?: number;
  numPoints?: number;
  angle?: number;
  text?: string;
  fontSize?: number;
  opacity?: number;
  tension?: number;
}

// Helper function to determine if a shape type should show fill property
const shouldShowFill = (type: string, shapeType?: string) => {
  if (type === "drawing") return false;
  if (type === "text") return true;
  if (type === "shape") {
    const nonFillShapes = ["line", "arrow", "spline"];
    return !nonFillShapes.includes(shapeType || "");
  }
  return true;
};

// Helper function to determine if a shape type should show stroke property
const shouldShowStroke = (type: string, shapeType?: string) => {
  if (type === "drawing") return true;
  if (type === "text") return false;
  if (type === "shape") {
    const strokeShapes = ["line", "arrow", "spline"];
    return strokeShapes.includes(shapeType || "");
  }
  return false;
};

// Helper function to determine if dimension controls should be shown
const shouldShowDimensions = (type: string) => {
  if (type === "drawing" || type === "text") return false;
  return true;
};

export function ShapeProperties() {
  const selectedElement = useSceneStore((state) => state.selectedElement);
  const activeScene = useSceneStore((state) => state.activeScene);
  const updateElement = useSceneStore((state) => state.updateElement);
  const setSelectedElement = useSceneStore((state) => state.setSelectedElement);
  const [inputValues, setInputValues] = useState<InputValues>({});

  // Update input values when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setInputValues({
        ...selectedElement.properties,
        rotation: selectedElement.rotation || 0,
      });
    }
  }, [selectedElement, selectedElement?.properties, selectedElement?.rotation]);

  // Debounced update function for numeric inputs
  const debouncedUpdate = useCallback(
    (updates: ElementUpdate) => {
      if (!selectedElement || !activeScene) return;
      const layer = activeScene.layers.find((l) =>
        l.elements.find((e) => e.id === selectedElement.id)
      );
      if (!layer) return;
      debounce(() => {
        updateElement(activeScene.id, layer.id, selectedElement.id, updates);
      }, 50)();
    },
    [activeScene?.id, selectedElement?.id, updateElement]
  );

  if (!selectedElement || !activeScene) return null;

  const handlePropertyChange = (
    property: string,
    value: string | number | boolean
  ) => {
    if (!selectedElement || !activeScene) return;
    const layer = activeScene.layers.find((l) =>
      l.elements.find((e) => e.id === selectedElement.id)
    );
    if (!layer) return;

    // Immediately update the input value for UI
    setInputValues((prev) => ({
      ...prev,
      [property]: value,
    }));

    if (property === "width" || property === "height") {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) return;

      debouncedUpdate({
        properties: {
          ...selectedElement.properties,
          [property]: numValue,
        },
      });
    } else if (property === "rotation") {
      const numValue = Math.round(Number(value));
      if (!isNaN(numValue)) {
        debouncedUpdate({
          rotation: numValue,
        });
      }
    } else if (property === "strokeWidth") {
      // Handle stroke width updates immediately
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        updateElement(activeScene.id, layer.id, selectedElement.id, {
          properties: {
            ...selectedElement.properties,
            strokeWidth: numValue,
          },
        });
      }
    } else {
      // For non-numeric properties (like colors), update store immediately
      updateElement(activeScene.id, layer.id, selectedElement.id, {
        properties: {
          ...selectedElement.properties,
          ...inputValues,
          [property]: value,
        },
      });
    }
  };

  const handleNumberInput = (
    property: string,
    value: string,
    defaultValue: number = 0
  ) => {
    const numValue = value === "" ? defaultValue : Number(value);
    if (!isNaN(numValue)) {
      handlePropertyChange(property, numValue);
    }
  };

  const handleBlur = () => {
    if (!selectedElement || !activeScene) return;
    const layer = activeScene.layers.find((l) =>
      l.elements.find((e) => e.id === selectedElement.id)
    );
    if (!layer) return;

    // Create updated element with all current input values
    const updatedElement = {
      ...selectedElement,
      rotation: Math.round(Number(inputValues.rotation || 0)),
      properties: {
        ...selectedElement.properties,
        ...inputValues,
      },
    };

    // Update the element in the scene
    updateElement(activeScene.id, layer.id, selectedElement.id, {
      rotation: updatedElement.rotation,
      properties: updatedElement.properties,
    });

    // Update the selected element state
    setSelectedElement(updatedElement);
  };

  const renderGeneralProperties = () => {
    const showFill = shouldShowFill(
      selectedElement.type,
      selectedElement.properties.shapeType as string
    );
    const showStroke = shouldShowStroke(
      selectedElement.type,
      selectedElement.properties.shapeType as string
    );

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFill && (
            <div className="space-y-2">
              <Label htmlFor="fill">Fill Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="fill"
                  value={inputValues.fill || "#000000"}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 w-8 rounded border"
                />
              </div>
            </div>
          )}

          {showStroke && (
            <div className="space-y-2">
              <Label htmlFor="stroke">Stroke Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="stroke"
                  value={inputValues.stroke || "#000000"}
                  onChange={(e) =>
                    handlePropertyChange("stroke", e.target.value)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 w-8 rounded border"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rotation">Rotation</Label>
            <Input
              id="rotation"
              type="number"
              value={Math.round(inputValues.rotation || 0)}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? 0 : Number(e.target.value);
                if (!isNaN(value)) {
                  handlePropertyChange("rotation", value);
                }
              }}
              onBlur={handleBlur}
              onKeyDown={(e) => e.stopPropagation()}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderShapeSpecificControls = () => {
    if (!selectedElement) return null;

    const elementType = selectedElement.type as
      | "drawing"
      | "text"
      | "shape"
      | "image";

    if (elementType === "drawing") {
      // Drawing controls are handled above
      return null;
    }

    if (elementType === "text") {
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Text Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Input
                id="text"
                type="text"
                value={inputValues.text || ""}
                onChange={(e) => handlePropertyChange("text", e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={inputValues.fontSize || 24}
                onChange={(e) =>
                  handleNumberInput("fontSize", e.target.value, 24)
                }
                onBlur={handleBlur}
                onKeyDown={(e) => e.stopPropagation()}
                min={1}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    const shapeType = selectedElement?.properties.shapeType as string;

    // Common width and height controls for all shapes except drawings and text
    const dimensionControls = shouldShowDimensions(
      selectedElement?.type || ""
    ) ? (
      <>
        <div className="space-y-2">
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            value={Math.max(0, Math.round(inputValues.width || 0))}
            onChange={(e) => handleNumberInput("width", e.target.value, 100)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.stopPropagation()}
            min={1}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            value={Math.max(0, Math.round(inputValues.height || 0))}
            onChange={(e) => handleNumberInput("height", e.target.value, 100)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.stopPropagation()}
            min={1}
            step={1}
          />
        </div>
      </>
    ) : null;

    if (elementType === "shape") {
      switch (shapeType) {
        case "rectangle":
          return dimensionControls;

        case "circle":
        case "ellipse":
          return dimensionControls;

        case "line":
        case "arrow":
        case "spline":
          return (
            <>
              {dimensionControls}
              <div className="space-y-2">
                <Label htmlFor="strokeWidth">Stroke Width</Label>
                <Input
                  id="strokeWidth"
                  type="number"
                  value={
                    (selectedElement.properties.strokeWidth as number) || 2
                  }
                  onChange={(e) =>
                    handleNumberInput("strokeWidth", e.target.value, 2)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={1}
                  step={1}
                />
              </div>
            </>
          );

        case "star":
          return (
            <>
              {dimensionControls}
              <div className="space-y-2">
                <Label htmlFor="outerRadius">Outer Radius</Label>
                <Input
                  id="outerRadius"
                  type="number"
                  value={
                    (selectedElement.properties.outerRadius as number) || 50
                  }
                  onChange={(e) =>
                    handleNumberInput("outerRadius", e.target.value, 50)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="innerRadius">Inner Radius</Label>
                <Input
                  id="innerRadius"
                  type="number"
                  value={
                    (selectedElement.properties.innerRadius as number) || 25
                  }
                  onChange={(e) =>
                    handleNumberInput("innerRadius", e.target.value, 25)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numPoints">Number of Points</Label>
                <Input
                  id="numPoints"
                  type="number"
                  value={(selectedElement.properties.numPoints as number) || 5}
                  onChange={(e) =>
                    handleNumberInput("numPoints", e.target.value, 5)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={3}
                  step={1}
                />
              </div>
            </>
          );

        case "arc":
        case "wedge":
          return (
            <>
              {dimensionControls}
              <div className="space-y-2">
                <Label htmlFor="angle">Angle</Label>
                <Input
                  id="angle"
                  type="number"
                  value={(selectedElement.properties.angle as number) || 180}
                  onChange={(e) =>
                    handleNumberInput("angle", e.target.value, 180)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
            </>
          );

        case "ring":
          return (
            <>
              {dimensionControls}
              <div className="space-y-2">
                <Label htmlFor="outerRadius">Outer Radius</Label>
                <Input
                  id="outerRadius"
                  type="number"
                  value={
                    (selectedElement.properties.outerRadius as number) || 50
                  }
                  onChange={(e) =>
                    handleNumberInput("outerRadius", e.target.value, 50)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="innerRadius">Inner Radius</Label>
                <Input
                  id="innerRadius"
                  type="number"
                  value={
                    (selectedElement.properties.innerRadius as number) || 25
                  }
                  onChange={(e) =>
                    handleNumberInput("innerRadius", e.target.value, 25)
                  }
                  onBlur={handleBlur}
                  onKeyDown={(e) => e.stopPropagation()}
                  min={1}
                  step={1}
                />
              </div>
            </>
          );

        default:
          return dimensionControls;
      }
    }

    return dimensionControls;
  };

  return (
    <div className="space-y-6">
      {renderGeneralProperties()}
      {renderShapeSpecificControls()}
    </div>
  );
}

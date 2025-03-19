"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCanvasSettingsStore } from "@/lib/store/canvas-settings-store";
import { useProjectStore } from "@/lib/store/project-store";
import { useSceneStore } from "@/lib/store/scene-store";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { CanvasSizePresets } from "../canvas/canvas-size-presets";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CanvasSettings() {
  const { settings, updateSettings } = useCanvasSettingsStore();
  const currentProject = useProjectStore((state) => state.currentProject);
  const updateProjectSettings = useProjectStore(
    (state) => state.updateProjectSettings
  );
  const onionSkinning = useSceneStore((state) => state.onionSkinning);
  const setOnionSkinning = useSceneStore((state) => state.setOnionSkinning);
  const setPosition = useCanvasStore((state) => state.setPosition);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const [dimensions, setDimensions] = useState(() => ({
    width: currentProject?.settings.width || 1920,
    height: currentProject?.settings.height || 1080,
  }));

  if (!currentProject) return null;

  const resetCanvasView = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleDimensionBlur = () => {
    if (
      dimensions.width !== currentProject.settings.width ||
      dimensions.height !== currentProject.settings.height
    ) {
      updateProjectSettings(dimensions);
      resetCanvasView();
    }
  };

  const handlePresetSelect = (newDimensions: {
    width: number;
    height: number;
  }) => {
    setDimensions(newDimensions);
    updateProjectSettings(newDimensions);
    resetCanvasView();
  };

  return (
    <div className="space-y-6">
      {/* Canvas Size Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Canvas Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <CanvasSizePresets
              width={dimensions.width}
              height={dimensions.height}
              onSelect={handlePresetSelect}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={dimensions.width}
                onChange={(e) =>
                  setDimensions((d) => ({
                    ...d,
                    width: Number(e.target.value),
                  }))
                }
                onBlur={handleDimensionBlur}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={dimensions.height}
                onChange={(e) =>
                  setDimensions((d) => ({
                    ...d,
                    height: Number(e.target.value),
                  }))
                }
                onBlur={handleDimensionBlur}
                min={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Grid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid">Show Grid</Label>
            <Switch
              id="show-grid"
              checked={settings.showGrid}
              onCheckedChange={(checked) =>
                updateSettings({ showGrid: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="grid-size">Grid Size</Label>
              <Input
                id="grid-size"
                type="number"
                min={1}
                value={settings.gridSize}
                onChange={(e) =>
                  updateSettings({ gridSize: Number(e.target.value) })
                }
                className="w-20 h-8"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="snap-grid">Snap to Grid</Label>
            <Switch
              id="snap-grid"
              checked={settings.snapToGrid}
              onCheckedChange={(checked) =>
                updateSettings({ snapToGrid: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-rulers">Show Rulers</Label>
            <Switch
              id="show-rulers"
              checked={settings.rulers}
              onCheckedChange={(checked) => updateSettings({ rulers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-safe-area">Show Safe Area</Label>
            <Switch
              id="show-safe-area"
              checked={settings.safeArea}
              onCheckedChange={(checked) =>
                updateSettings({ safeArea: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Onion Skinning Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Onion Skinning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-onion">Enable Onion Skinning</Label>
            <Switch
              id="enable-onion"
              checked={onionSkinning.enabled}
              onCheckedChange={(checked) =>
                setOnionSkinning({ enabled: checked })
              }
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prev-frames">Previous Frames</Label>
                <Input
                  id="prev-frames"
                  type="number"
                  min={0}
                  max={10}
                  value={onionSkinning.prevFrames}
                  onChange={(e) =>
                    setOnionSkinning({ prevFrames: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next-frames">Next Frames</Label>
                <Input
                  id="next-frames"
                  type="number"
                  min={0}
                  max={10}
                  value={onionSkinning.nextFrames}
                  onChange={(e) =>
                    setOnionSkinning({ nextFrames: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="opacity">Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(onionSkinning.opacity * 100)}%
                </span>
              </div>
              <Slider
                id="opacity"
                min={0}
                max={100}
                step={1}
                value={[onionSkinning.opacity * 100]}
                onValueChange={([value]) =>
                  setOnionSkinning({ opacity: value / 100 })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prev-color">Previous Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="prev-color"
                    value={onionSkinning.prevColor}
                    onChange={(e) =>
                      setOnionSkinning({ prevColor: e.target.value })
                    }
                    className="h-8 w-8 rounded border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="next-color">Next Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="next-color"
                    value={onionSkinning.nextColor}
                    onChange={(e) =>
                      setOnionSkinning({ nextColor: e.target.value })
                    }
                    className="h-8 w-8 rounded border"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

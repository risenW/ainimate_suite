"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useSceneStore } from "@/lib/store/scene-store";
import { MenubarShortcut } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Quality presets with their corresponding bitrate multipliers
const QUALITY_PRESETS = {
  "Low (2 Mbps)": 0.4,
  "Medium (5 Mbps)": 1,
  "High (10 Mbps)": 2,
  "Very High (20 Mbps)": 4,
} as const;

type QualityPreset = keyof typeof QUALITY_PRESETS;

interface ExportSettings {
  width: number;
  height: number;
  fps: number;
  quality: number;
  includeBackground: boolean;
}

export function ExportSettingsDialog() {
  const isExporting = useSceneStore((state) => state.isExporting);
  const exportVideo = useSceneStore((state) => state.exportVideo);
  const hasFrames = useSceneStore((state) => {
    const activeScene = state.activeScene;
    return activeScene?.layers.some((l) => l.frames.some((f) => f.elements.length > 0)) ?? false;
  });

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ExportSettings>({
    width: 1920,
    height: 1080,
    fps: 24,
    quality: QUALITY_PRESETS["Medium (5 Mbps)"],
    includeBackground: true,
  });

  const handleExport = async () => {
    setOpen(false);
    await exportVideo(settings);
  };

  const handleQualityChange = (preset: QualityPreset) => {
    setSettings({ ...settings, quality: QUALITY_PRESETS[preset] });
  };

  const getCurrentQualityPreset = () => {
    const entry = Object.entries(QUALITY_PRESETS).find(
      ([, multiplier]) => multiplier === settings.quality
    );
    return entry ? (entry[0] as QualityPreset) : "Medium (5 Mbps)";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
            (isExporting || !hasFrames) && "opacity-50 cursor-not-allowed"
          )}
          disabled={isExporting || !hasFrames}
        >
          Export Project
          <MenubarShortcut>
            {navigator?.platform?.toLowerCase().includes("mac")
              ? "⌘E"
              : "Ctrl+E"}
          </MenubarShortcut>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={settings.width}
              onChange={(e) =>
                setSettings({ ...settings, width: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={settings.height}
              onChange={(e) =>
                setSettings({ ...settings, height: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="fps">FPS</Label>
            <Input
              id="fps"
              type="number"
              value={settings.fps}
              onChange={(e) =>
                setSettings({ ...settings, fps: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="quality">Quality</Label>
            <Select
              value={getCurrentQualityPreset()}
              onValueChange={handleQualityChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(QUALITY_PRESETS).map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="includeBackground">Include Background</Label>
            <Switch
              id="includeBackground"
              checked={settings.includeBackground}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, includeBackground: checked })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

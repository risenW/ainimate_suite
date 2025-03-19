"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MenubarShortcut } from "@/components/ui/menubar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/store/project-store";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProjectSettingsDialog() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const updateProjectSettings = useProjectStore(
    (state) => state.updateProjectSettings
  );
  const [settings, setSettings] = useState(() => ({
    name: currentProject?.settings.name || "",
    width: currentProject?.settings.width || 1920,
    height: currentProject?.settings.height || 1080,
    fps: currentProject?.settings.fps || 30,
    duration: currentProject?.settings.duration || 10,
  }));
  const [open, setOpen] = useState(false);

  if (!currentProject) return null;

  const handleSave = () => {
    updateProjectSettings(settings);
    setOpen(false);
  };

  const handleCancel = () => {
    setSettings({
      name: currentProject.settings.name,
      width: currentProject.settings.width,
      height: currentProject.settings.height,
      fps: currentProject.settings.fps,
      duration: currentProject.settings.duration,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left"
          )}
        >
          Project Settings
          <MenubarShortcut>
            {navigator?.platform?.toLowerCase().includes("mac")
              ? "⌘,"
              : "Ctrl+,"}
          </MenubarShortcut>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>Configure your project settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) =>
                setSettings((s) => ({ ...s, name: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={settings.width}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, width: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={settings.height}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, height: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fps">FPS</Label>
              <Input
                id="fps"
                type="number"
                value={settings.fps}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, fps: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (s)</Label>
              <Input
                id="duration"
                type="number"
                value={settings.duration}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    duration: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

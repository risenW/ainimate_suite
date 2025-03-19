"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProjectSettings } from "@/types/project";
import { useProjectStore } from "@/lib/store/project-store";
import { CanvasSizePresets } from "@/components/editor/canvas/canvas-size-presets";

interface ProjectCreatorSettings {
  name: string;
  width: number | "";
  height: number | "";
  fps: number | "";
  duration: number | "";
}

const defaultSettings: ProjectCreatorSettings = {
  name: "Untitled Project",
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 60,
};

export function ProjectCreator() {
  const router = useRouter();
  const [settings, setSettings] =
    useState<ProjectCreatorSettings>(defaultSettings);
  const [open, setOpen] = useState(false);
  const createProject = useProjectStore((state) => state.createProject);

  const handleCreate = () => {
    // Convert empty strings to default values before creating project
    const projectSettings: ProjectSettings = {
      name: settings.name || "Untitled Project",
      width: settings.width === "" ? 1920 : (settings.width as number),
      height: settings.height === "" ? 1080 : (settings.height as number),
      fps: settings.fps === "" ? 30 : (settings.fps as number),
      duration: settings.duration === "" ? 60 : (settings.duration as number),
    };

    const project = createProject(projectSettings);
    setOpen(false);
    router.push(`/editor?project=${project.id}`);
  };

  const handlePresetSelect = (dimensions: {
    width: number;
    height: number;
  }) => {
    setSettings((s) => ({ ...s, ...dimensions }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Start Editing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Configure your animation project settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Canvas Size</Label>
            <CanvasSizePresets
              width={settings.width as number}
              height={settings.height as number}
              onSelect={handlePresetSelect}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={settings.width}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    width: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={settings.height}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    height: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fps">FPS</Label>
              <Input
                id="fps"
                type="number"
                value={settings.fps}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    fps: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={settings.duration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    duration:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreate}>Create Project</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

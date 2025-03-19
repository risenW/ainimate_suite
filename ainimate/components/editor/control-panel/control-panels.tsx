"use client";

import { Settings2, Wand2, Layers } from "lucide-react";
import { CanvasSettings } from "./canvas-settings";
import { AIPanel } from "./ai/ai-panel";
import { LayerPanel } from "@/components/editor/scene/layer-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSceneStore } from "@/lib/store/scene-store";
import { useEffect, useState } from "react";
import { ShapeProperties } from "./shape-properties";
import { useToolStore } from "@/lib/store/tool-store";

export function ControlPanels() {
  const [activeTab, setActiveTab] = useState("scene");
  const selectedElement = useSceneStore((state) => state.selectedElement);
  const activeScene = useSceneStore((state) => state.activeScene);
  const activeTool = useToolStore((state) => state.activeTool);

  // Switch to properties tab when an element is selected or when drawing is completed
  useEffect(() => {
    // Switch to properties when an element is selected
    if (selectedElement) {
      setActiveTab("properties");
    }
    // Switch to properties when drawing tool is active and we have an active scene
    // This ensures the panel is ready when the drawing is completed
    else if (activeTool === "pencil" && activeScene) {
      setActiveTab("properties");
    }
  }, [selectedElement, activeTool, activeScene]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-3 bg-muted/50 shrink-0">
        <TabsTrigger
          value="scene"
          className="flex items-center justify-center gap-1.5"
        >
          <Layers className="size-4 shrink-0" />
          <span>Layers</span>
        </TabsTrigger>
        <TabsTrigger
          value="properties"
          className="flex items-center justify-center gap-1.5"
        >
          <Settings2 className="size-4 shrink-0" />
          <span>Properties</span>
        </TabsTrigger>
        <TabsTrigger
          value="ai"
          className="flex items-center justify-center gap-1.5"
        >
          <Wand2 className="size-4 shrink-0" />
          <span>AI</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scene" className="flex-1 overflow- m-0">
        <LayerPanel />
      </TabsContent>
      <TabsContent
        value="properties"
        className="flex-1 overflow-y-auto p-4 m-0"
      >
        {selectedElement ? <ShapeProperties /> : <CanvasSettings />}
      </TabsContent>
      <TabsContent value="ai" className="flex-1 overflow-y-auto p-4 m-0">
        <AIPanel />
      </TabsContent>
    </Tabs>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react";
import { useSceneStore } from "@/lib/store/scene-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { SceneLayer } from "@/lib/store/scene-store";
import { create } from "zustand";

interface LayerPanelStore {
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
}

export const useLayerPanelStore = create<LayerPanelStore>((set) => ({
  activeLayerId: null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),
}));

export function LayerPanel() {
  const activeScene = useSceneStore((state) => state.activeScene);
  const { createLayer, removeLayer, updateLayer } = useSceneStore();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [layerName, setLayerName] = useState("");
  const activeLayerId = useLayerPanelStore((state) => state.activeLayerId);
  const setActiveLayerId = useLayerPanelStore(
    (state) => state.setActiveLayerId
  );

  const handleLayerNameEdit = (layer: SceneLayer) => {
    setEditingLayerId(layer.id);
    setLayerName(layer.name);
  };

  const handleLayerNameSave = () => {
    if (!activeScene || !editingLayerId || !layerName.trim()) return;
    updateLayer(activeScene.id, editingLayerId, {
      name: layerName.trim(),
    });
    setEditingLayerId(null);
  };

  const handleCreateLayer = () => {
    if (!activeScene) return;
    createLayer(activeScene.id, "Untitled", "midground");
  };

  if (!activeScene) {
    return (
      <div className="h-full p-4 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground mb-4">
          No scene created yet
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Layers</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCreateLayer}
            className="h-8 w-8"
            title="Add Layer"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          {activeScene.layers.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-sm text-sm transition-colors",
                "hover:bg-accent/50",
                "cursor-pointer",
                activeLayerId === layer.id && "bg-accent",
                !layer.visible && "opacity-50",
                "min-w-0"
              )}
              onClick={() => setActiveLayerId(layer.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(activeScene.id, layer.id, {
                    visible: !layer.visible,
                  });
                }}
                className="opacity-50 hover:opacity-100 shrink-0"
              >
                {layer.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(activeScene.id, layer.id, {
                    locked: !layer.locked,
                  });
                }}
                className="opacity-50 hover:opacity-100 shrink-0"
              >
                {layer.locked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </button>
              {editingLayerId === layer.id ? (
                <input
                  type="text"
                  value={layerName}
                  onChange={(e) => setLayerName(e.target.value)}
                  onBlur={handleLayerNameSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLayerNameSave();
                    } else if (e.key === "Escape") {
                      setEditingLayerId(null);
                    }
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary px-1 rounded-sm"
                  autoFocus
                />
              ) : (
                <span
                  className="flex-1 min-w-0 truncate max-w-60"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleLayerNameEdit(layer);
                  }}
                >
                  {layer.name}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeScene.layers.length > 1) {
                    removeLayer(activeScene.id, layer.id);
                    if (activeLayerId === layer.id) {
                      setActiveLayerId(null);
                    }
                  }
                }}
                className="opacity-0 group-hover:opacity-50 hover:opacity-100 text-destructive shrink-0"
                title="Delete Layer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {activeLayerId && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Layer Settings</h4>
            <div className="space-y-2">
              <Label htmlFor="opacity">Opacity</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={
                    (activeScene.layers.find((l) => l.id === activeLayerId)
                      ?.opacity || 1) * 100
                  }
                  onChange={(e) => {
                    updateLayer(activeScene.id, activeLayerId, {
                      opacity: Number(e.target.value) / 100,
                    });
                  }}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">
                  {Math.round(
                    (activeScene.layers.find((l) => l.id === activeLayerId)
                      ?.opacity || 1) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

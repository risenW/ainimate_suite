import { useSceneStore, type SceneLayer } from "@/lib/store/scene-store";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useTimelineContext } from "./context";
import { useLayerPanelStore } from "@/lib/store/layer-panel-store";

interface LayerRowProps {
  layer: SceneLayer;
}

export function LayerRow({ layer }: LayerRowProps) {
  const { activeScene } = useTimelineContext();
  const activeLayerId = useLayerPanelStore((state) => state.activeLayerId);
  const setActiveLayerId = useLayerPanelStore(
    (state) => state.setActiveLayerId
  );

  return (
    <div
      className={cn(
        "h-7 flex items-center gap-2 p-1.5 border-b",
        !layer.visible && "opacity-50",
        "cursor-pointer hover:bg-accent/50",
        activeLayerId === layer.id && "bg-accent"
      )}
      onClick={() => setActiveLayerId(layer.id)}
    >
      <button
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          if (!activeScene) return;
          useSceneStore.getState().updateLayer(activeScene.id, layer.id, {
            visible: !layer.visible,
          });
        }}
        className="opacity-50 hover:opacity-100 shrink-0"
      >
        {layer.visible ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3" />
        )}
      </button>
      <button
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          if (!activeScene) return;
          useSceneStore.getState().updateLayer(activeScene.id, layer.id, {
            locked: !layer.locked,
          });
        }}
        className="opacity-50 hover:opacity-100 shrink-0"
      >
        {layer.locked ? (
          <Lock className="h-3 w-3" />
        ) : (
          <Unlock className="h-3 w-3" />
        )}
      </button>
      <span className="flex-1 min-w-0 truncate text-xs">{layer.name}</span>
    </div>
  );
}

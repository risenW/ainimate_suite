import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { useSceneStore } from "@/lib/store/scene-store";

export function OnionSkinSettings() {
  const onionSkinning = useSceneStore((state) => state.onionSkinning);
  const setOnionSkinning = useSceneStore((state) => state.setOnionSkinning);
  const isPlaying = useSceneStore((state) => state.isPlaying);

  return (
      <Button
        variant={onionSkinning.enabled ? "secondary" : "ghost"}
        size="icon"
        onClick={() => setOnionSkinning({ enabled: !onionSkinning.enabled })}
        title="Toggle Onion Skinning"
        disabled={isPlaying}
      >
        <Layers className="h-4 w-4" />
      </Button>
  );
} 

import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Repeat } from "lucide-react";
import { useSceneStore } from "@/lib/store/scene-store";
import { OnionSkinSettings } from "./onion-skin-settings";

export function PlaybackControls() {
  const isPlaying = useSceneStore((state) => state.isPlaying);
  const currentFrame = useSceneStore((state) => state.currentFrame);
  const duration = useSceneStore((state) => state.duration);
  const isLooping = useSceneStore((state) => state.isLooping);
  const { playAnimation, pauseAnimation, setCurrentFrame, setLooping } =
    useSceneStore();

  return (
    <div className="relative h-12 border-b flex items-center px-4 gap-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentFrame(0)}
          className="h-8 w-8"
          disabled={isPlaying}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isPlaying ? pauseAnimation() : playAnimation())}
          className="h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentFrame(duration - 1)}
          className="h-8 w-8"
          disabled={isPlaying}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button
          variant={isLooping ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setLooping(!isLooping)}
          className="h-8 w-8"
          disabled={isPlaying}
          title="Loop Playback"
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Frame</span>
        <span className="text-sm font-medium">{currentFrame + 1}</span>
        <span className="text-sm text-muted-foreground">of {duration}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 border-l pl-4">
        <OnionSkinSettings />
      </div>
    </div>
  );
}

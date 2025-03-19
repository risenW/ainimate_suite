import { useTimelineContext } from "./context";

export function TimelineHeader() {
  const { fps, duration, totalFrames } = useTimelineContext();

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      {/* Time Ruler */}
      <div className="flex border-b h-4">
        {Array.from({ length: duration }).map((_, i) => (
          <div
            key={`time-${i}`}
            className="flex-none border-r"
            style={{ width: `${fps * 32}px` }}
          >
            <div className="px-2 text-xs text-muted-foreground leading-none">
              {i + 1}s
            </div>
          </div>
        ))}
      </div>
      {/* Frame Numbers */}
      <div className="flex h-4 border-b">
        {Array.from({ length: totalFrames }).map((_, i) => (
          <div key={`frame-${i}`} className="w-8 flex-none border-r">
            <div className="px-2 text-xs text-muted-foreground text-center leading-none">
              {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

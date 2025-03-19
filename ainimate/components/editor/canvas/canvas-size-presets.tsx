/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CANVAS_PRESETS = {
  "Instagram Story": { width: 1080, height: 1920 },
  "Instagram Post": { width: 1080, height: 1080 },
  YouTube: { width: 1920, height: 1080 },
  TikTok: { width: 1080, height: 1920 },
  "Desktop (16:9)": { width: 1920, height: 1080 },
  "Desktop (4:3)": { width: 1600, height: 1200 },
  Twitter: { width: 1200, height: 675 },
} as const;

interface CanvasSizePresetsProps {
  width: number;
  height: number;
  onSelect: (dimensions: { width: number; height: number }) => void;
}

export function CanvasSizePresets({
  width,
  height,
  onSelect,
}: CanvasSizePresetsProps) {
  const getCurrentPreset = () => {
    const preset = Object.entries(CANVAS_PRESETS).find(
      ([_, size]) => size.width === width && size.height === height
    );
    return preset ? preset[0] : "Custom";
  };

  const handlePresetChange = (preset: string) => {
    if (preset === "Custom") {
      // For Custom, keep the current dimensions
      onSelect({ width, height });
      return;
    }
    const newDimensions = CANVAS_PRESETS[preset as keyof typeof CANVAS_PRESETS];
    onSelect(newDimensions);
  };

  return (
    <Select value={getCurrentPreset()} onValueChange={handlePresetChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select size preset" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CANVAS_PRESETS).map(([name, dimensions]) => (
          <SelectItem key={name} value={name}>
            {name} ({dimensions.width}x{dimensions.height})
          </SelectItem>
        ))}
        <SelectItem value="Custom">
          Custom ({width}x{height})
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

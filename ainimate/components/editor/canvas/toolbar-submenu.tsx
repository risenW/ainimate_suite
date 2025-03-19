import { ToolbarButton } from "./toolbar-button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolGroupSection, ToolItem } from "../../../types/tool";

interface ToolbarSubmenuProps {
  tools: ToolGroupSection[];
  activeToolId?: string;
  onSelectTool: (tool: ToolItem) => void;
}

export function ToolbarSubmenu({
  tools,
  activeToolId,
  onSelectTool,
}: ToolbarSubmenuProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="absolute left-16 top-0 flex flex-col gap-2 bg-background rounded-md border shadow-sm p-2">
        {tools.map((section, index) => (
          <div key={section.group}>
            {index > 0 && <Separator className="my-2" />}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {section.group}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1 place-items-center">
              {section.items.map((tool) => (
                <ToolbarButton
                  key={tool.id}
                  icon={tool.icon}
                  label={tool.label}
                  onClick={() => onSelectTool(tool)}
                  isActive={activeToolId === tool.id}
                  disabled={tool.disabled}
                  className="h-9 w-9 flex items-center justify-center"
                  tooltipSide="bottom"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}

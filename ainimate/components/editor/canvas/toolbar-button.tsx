import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  tooltipSide?: "right" | "bottom";
}

export function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  isActive,
  disabled,
  className,
  tooltipSide = "right",
}: ToolbarButtonProps) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-10 w-10",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-colors duration-200",
            isActive && "bg-accent text-accent-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          title={label}
        >
          <Icon className={cn("h-4 w-4", isActive && "text-foreground")} />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        align={tooltipSide === "bottom" ? "center" : "start"}
        sideOffset={tooltipSide === "bottom" ? 5 : 10}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

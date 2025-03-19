"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  side: "left" | "right";
  defaultCollapsed?: boolean;
  className?: string;
}

export function CollapsibleSidebar({
  children,
  side,
  defaultCollapsed = false,
  className,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={cn(
        "relative flex h-full transition-all duration-300",
        isCollapsed ? "w-10" : side === "left" ? "w-80" : "w-96",
        side === "left" ? "border-r" : "border-l",
        className
      )}
    >
      <div className={cn("flex-1", isCollapsed && "hidden")}>{children}</div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 h-6 w-6 shrink-0 p-0",
          side === "left"
            ? "-right-3 rounded-l-none border-l-0"
            : "-left-3 rounded-r-none border-r-0",
          "border bg-background hover:bg-background z-50"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {side === "left" ? (
          isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )
        ) : isCollapsed ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {isCollapsed && (
        <div className="flex h-full w-full flex-col items-center justify-center">
          {side === "left" ? (
            <span
              className="-rotate-90 absolute whitespace-nowrap text-sm font-medium tracking-wide text-muted-foreground"
              style={{
                right: 20,
                top: "50%",
                transform: "translateY(-50%) rotate(-90deg)",
              }}
            >
              Scene Manager
            </span>
          ) : (
            <span
              className="rotate-90 absolute whitespace-nowrap text-sm font-medium tracking-wide text-muted-foreground"
              style={{
                left: 20,
                top: "50%",
                transform: "translateY(-50%) rotate(90deg)",
              }}
            >
              Properties
            </span>
          )}
        </div>
      )}
    </div>
  );
}

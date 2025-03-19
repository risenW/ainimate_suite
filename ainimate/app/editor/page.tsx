"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProjectStore } from "@/lib/store/project-store";
import AnimatorCanvas from "@/components/editor/canvas/animator-canvas";
import { NavMenu } from "@/components/navigation/nav-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Timeline } from "@/components/timeline/timeline";
import { ControlPanels } from "@/components/editor/control-panel/control-panels";
import { CollapsibleSidebar } from "@/components/editor/sidebar/collapsible-sidebar";
import { LAYOUT } from "@/lib/constants/layout";
import { useSceneStore } from "@/lib/store/scene-store";
import { useSyncSocketState } from "@/hooks/use-sync-socket-state";
function EditorContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const loadProject = useProjectStore((state) => state.loadProject);
  const currentProject = useProjectStore((state) => state.currentProject);

  // Get scene state
  const activeScene = useSceneStore((state) => state.activeScene);
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  useSyncSocketState();

  if (!currentProject) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div
        className={`h-[${LAYOUT.HEADER.HEIGHT}px] border-b px-4 flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">{currentProject.settings.name}</h1>
          <NavMenu />
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Canvas Area */}
          <div className="flex-1 relative min-h-0">
            <AnimatorCanvas activeScene={activeScene} />
          </div>

          {/* Timeline */}
          <div
            className={`h-[${LAYOUT.TIMELINE.HEIGHT}px] border-t bg-background`}
          >
            <Timeline
              fps={currentProject.settings.fps}
              duration={currentProject.settings.duration}
            />
          </div>
        </div>

        {/* Right Sidebar - Properties & AI */}
        <CollapsibleSidebar side="right">
          <ControlPanels />
        </CollapsibleSidebar>
      </div>
    </div>
  );
}

export default function Editor() {
  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <EditorContent />
      </Suspense>
    </div>
  );
}

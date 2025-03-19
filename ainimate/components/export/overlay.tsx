"use client"

import { useSceneStore } from "@/lib/store/scene-store"
import { Loader2 } from "lucide-react"

export function ExportOverlay() {
    const isExporting = useSceneStore((state) => state.isExporting)
    const progress = useSceneStore((state) => state.exportProgress)

    if (!isExporting) return null

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-background border rounded-lg p-8 shadow-lg flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-lg font-medium">Exporting Animation...</span>
                </div>
                <div className="w-full max-w-sm">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                        {progress}% Complete
                    </p>
                </div>
            </div>
        </div>
    )
} 

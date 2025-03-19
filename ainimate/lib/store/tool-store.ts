import { create } from 'zustand'

type ToolType = 'select' | 'shape' | 'pencil' | 'brush' | 'text'

interface ToolStore {
    activeTool: ToolType
    setActiveTool: (tool: ToolType) => void
}

export const useToolStore = create<ToolStore>((set) => ({
    activeTool: 'select',
    setActiveTool: (tool) => set({ activeTool: tool })
})) 

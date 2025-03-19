import { create } from 'zustand';
export const useToolStore = create((set) => ({
    activeTool: 'select',
    setActiveTool: (tool) => set({ activeTool: tool })
}));

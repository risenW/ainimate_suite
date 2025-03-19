import { create } from 'zustand';
export const useCanvasStore = create((set) => ({
    stage: null,
    setStage: (stage) => set({ stage }),
    zoom: 1,
    setZoom: (zoom) => set({ zoom }),
    isDragging: false,
    setIsDragging: (isDragging) => set({ isDragging }),
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
    panEnabled: false,
    setPanEnabled: (enabled) => set({ panEnabled: enabled }),
}));

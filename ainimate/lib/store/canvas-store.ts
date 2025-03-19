import { create } from 'zustand'
import { Stage } from 'konva/lib/Stage'

interface CanvasState {
  stage: Stage | null
  setStage: (stage: Stage) => void
  zoom: number
  setZoom: (zoom: number) => void
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
  panEnabled: boolean
  setPanEnabled: (enabled: boolean) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
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

import { create } from 'zustand'

interface CanvasSettings {
  showGrid: boolean
  gridSize: number
  snapToGrid: boolean
  backgroundColor: string
  safeArea: boolean
  rulers: boolean
}

interface CanvasSettingsStore {
  settings: CanvasSettings
  updateSettings: (settings: Partial<CanvasSettings>) => void
}

const defaultSettings: CanvasSettings = {
  showGrid: false,
  gridSize: 20,
  snapToGrid: false,
  backgroundColor: '#FFFFFF',
  safeArea: false,
  rulers: false,
}

export const useCanvasSettingsStore = create<CanvasSettingsStore>((set) => ({
  settings: defaultSettings,
  updateSettings: (newSettings) => 
    set((state) => ({ 
      settings: { ...state.settings, ...newSettings } 
    })),
})) 

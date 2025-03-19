import { create } from 'zustand';
const defaultSettings = {
    showGrid: false,
    gridSize: 20,
    snapToGrid: false,
    backgroundColor: '#FFFFFF',
    safeArea: false,
    rulers: false,
};
export const useCanvasSettingsStore = create((set) => ({
    settings: defaultSettings,
    updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
    })),
}));

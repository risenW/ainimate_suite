import { create } from 'zustand';
export const useLayerPanelStore = create((set) => ({
    activeLayerId: null,
    setActiveLayerId: (id) => set({ activeLayerId: id }),
}));

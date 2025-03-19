import { create } from 'zustand'

interface LayerPanelStore {
  activeLayerId: string | null
  setActiveLayerId: (id: string | null) => void
}

export const useLayerPanelStore = create<LayerPanelStore>((set) => ({
  activeLayerId: null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),
})) 

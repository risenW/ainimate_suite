import { useEffect } from 'react'
import { useCanvasStore } from '@/lib/store/canvas-store'
import { useSceneStore } from '@/lib/store/scene-store'
import { useLayerPanelStore } from '@/lib/store/layer-panel-store'

export function useCanvasShortcuts() {
  const { setZoom, zoom } = useCanvasStore()
  const selectedElement = useSceneStore((state) => state.selectedElement)
  const activeScene = useSceneStore((state) => state.activeScene)
  const currentFrame = useSceneStore((state) => state.currentFrame)
  const onionSkinning = useSceneStore((state) => state.onionSkinning)
  const { removeElement, setSelectedElement, captureFrame, deleteFrame, setCurrentFrame, setOnionSkinning } = useSceneStore()
  const activeLayerId = useLayerPanelStore((state) => state.activeLayerId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      // Delete selected element with backspace
      if (selectedElement && activeScene && e.key === 'Backspace') {
        e.preventDefault()
        const layer = activeScene.layers.find(l => l.elements.find(e => e.id === selectedElement.id))
        if (!layer || layer.locked) return
        setSelectedElement(null)
        removeElement(activeScene.id, layer.id, selectedElement.id)
      } 
      // Zoom controls
      else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setZoom(1)
      } else if (e.key === '+' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setZoom(Math.min(zoom * 1.2, 5))
      } else if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setZoom(Math.max(zoom / 1.2, 0.1))
      }

      // Space to capture frame (only if we have an active layer)
      if (e.code === 'Space' && activeScene && activeLayerId) {
        e.preventDefault()
        const layer = activeScene.layers.find(l => l.id === activeLayerId)
        if (!layer || layer.locked) return
        captureFrame(activeScene.id)
      }

      // Shift+Tab to move to next frame and select it for editing
      if (e.key === 'Tab' && e.shiftKey && activeScene && activeLayerId) {
        e.preventDefault()
        const nextFrame = currentFrame + 1
        useSceneStore.getState().selectFrame(activeScene.id, nextFrame)
      }

      // Frame navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentFrame(Math.max(0, currentFrame - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentFrame(currentFrame + 1)
      }

      // Delete current frame (only if we have an active layer)
      if (e.key === 'Backspace' && activeScene && activeLayerId && !selectedElement) {
        const layer = activeScene.layers.find(l => l.id === activeLayerId)
        if (!layer || layer.locked) return
        
        const frame = layer.frames.find(f => f.frameNumber === currentFrame)
        if (frame) {
          deleteFrame(activeScene.id, frame.id)
        }
      }

      // Duplicate frame with Alt+D (only if we have an active layer)
      if (e.key.toLowerCase() === 'd' && e.ctrlKey && activeScene && activeLayerId) {
        e.preventDefault()
        const layer = activeScene.layers.find(l => l.id === activeLayerId)
        if (!layer || layer.locked) return
        useSceneStore.getState().duplicateFrame(activeScene.id, currentFrame)
      }

      // Toggle onion skinning with O
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault()
        setOnionSkinning({ enabled: !onionSkinning.enabled })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedElement,
    activeScene,
    activeLayerId,
    removeElement,
    setSelectedElement,
    setZoom,
    zoom,
    captureFrame,
    currentFrame,
    deleteFrame,
    setCurrentFrame,
    onionSkinning,
    setOnionSkinning
  ])

  return null
} 

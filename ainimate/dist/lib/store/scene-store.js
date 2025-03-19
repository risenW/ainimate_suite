import { create } from 'zustand';
import { generateId } from '@/lib/utils';
import { exportToMP4 } from '@/lib/utils/video-export';
import { useCanvasStore } from '@/lib/store/canvas-store';
import { useLayerPanelStore } from '@/lib/store/layer-panel-store';
export const useSceneStore = create((set, get) => ({
    scenes: [],
    activeScene: null,
    selectedElement: null,
    currentFrame: 0,
    isPlaying: false,
    fps: 12,
    duration: 24,
    onionSkinning: {
        enabled: false,
        prevFrames: 1,
        nextFrames: 1,
        opacity: 0.3,
        prevColor: '#FF0000',
        nextColor: '#0000FF'
    },
    isLooping: true,
    isExporting: false,
    exportProgress: 0,
    createScene: (name) => {
        const firstLayerId = generateId();
        const newScene = {
            id: generateId(),
            name,
            layers: [
                {
                    id: firstLayerId,
                    name: 'Untitled',
                    type: 'midground',
                    visible: true,
                    locked: false,
                    opacity: 1,
                    elements: [],
                    frames: [],
                    zIndex: 0
                }
            ],
            active: true
        };
        set((state) => ({
            scenes: [...state.scenes, newScene],
            activeScene: newScene
        }));
        // Set the first layer as active in the layer panel
        useLayerPanelStore.getState().setActiveLayerId(firstLayerId);
        return newScene;
    },
    createLayer: (sceneId, name, type) => {
        const newLayer = {
            id: generateId(),
            name,
            type,
            visible: true,
            locked: false,
            opacity: 1,
            elements: [],
            frames: [],
            zIndex: 0
        };
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            newLayer.zIndex = scene.layers.length;
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? { ...s, layers: [...s.layers, newLayer] }
                : s);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null
            };
        });
        return newLayer;
    },
    removeLayer: (sceneId, layerId) => {
        set((state) => {
            const updatedScenes = state.scenes.map(scene => scene.id === sceneId
                ? {
                    ...scene,
                    layers: scene.layers.filter(l => l.id !== layerId)
                }
                : scene);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null
            };
        });
    },
    updateLayer: (sceneId, layerId, updates) => {
        set((state) => {
            const updatedScenes = state.scenes.map(scene => scene.id === sceneId
                ? {
                    ...scene,
                    layers: scene.layers.map(layer => layer.id === layerId
                        ? { ...layer, ...updates }
                        : layer)
                }
                : scene);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null
            };
        });
    },
    reorderLayers: (sceneId, layerIds) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            // Create a map of layers by id
            const layerMap = new Map(scene.layers.map(l => [l.id, l]));
            // Create new ordered array of layers
            const orderedLayers = layerIds
                .map(id => layerMap.get(id))
                .filter((l) => l !== undefined)
                .map((layer, index) => ({
                ...layer,
                zIndex: index
            }));
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? { ...s, layers: orderedLayers }
                : s);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null
            };
        });
    },
    addElement: (sceneId, layerId, element) => {
        const newElement = {
            ...element,
            id: generateId(),
            layerType: element.layerType || 'midground' // Default to midground if not specified
        };
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            const layer = scene.layers.find(l => l.id === layerId);
            if (!layer)
                return state;
            // Add element to the specified layer
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === layerId
                        ? { ...l, elements: [...l.elements, newElement] }
                        : l)
                }
                : s);
            // Update frames with the new element
            const currentFrame = state.currentFrame;
            const existingFrame = layer.frames.find(f => f.frameNumber === currentFrame);
            // Create or update frame with current elements
            const newFrame = {
                id: existingFrame?.id || generateId(),
                elements: [
                    // Keep existing elements from other layers
                    ...(existingFrame?.elements || []).filter((e) => e.layerType !== layer.type),
                    // Add elements from the active layer
                    ...layer.elements.map((e) => ({ ...e })),
                    newElement
                ],
                frameNumber: currentFrame,
                length: existingFrame?.length || 1
            };
            const finalScenes = updatedScenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === layerId
                        ? {
                            ...l,
                            frames: [
                                ...l.frames.filter(f => f.frameNumber !== currentFrame),
                                newFrame
                            ].sort((a, b) => a.frameNumber - b.frameNumber)
                        }
                        : l)
                }
                : s);
            return {
                scenes: finalScenes,
                activeScene: finalScenes.find(s => s.id === sceneId) || null
            };
        });
        return newElement.id;
    },
    removeScene: (sceneId) => {
        set((state) => {
            const newScenes = state.scenes.filter(s => s.id !== sceneId);
            // If we're removing the active scene, activate another one
            if (state.activeScene?.id === sceneId && newScenes.length > 0) {
                newScenes[0].active = true;
                return {
                    scenes: newScenes,
                    activeScene: newScenes[0]
                };
            }
            return { scenes: newScenes };
        });
    },
    updateScene: (sceneId, updates) => {
        set((state) => ({
            scenes: state.scenes.map(scene => scene.id === sceneId
                ? { ...scene, ...updates }
                : scene)
        }));
    },
    removeElement: (sceneId, layerId, elementId) => {
        set((state) => {
            const updatedScenes = state.scenes.map(scene => scene.id === sceneId
                ? {
                    ...scene,
                    layers: scene.layers.map(layer => layer.id === layerId
                        ? { ...layer, elements: layer.elements.filter(e => e.id !== elementId) }
                        : layer)
                }
                : scene);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null,
                selectedElement: null
            };
        });
    },
    updateElement: (sceneId, layerId, elementId, updates) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            const layer = scene.layers.find(l => l.id === layerId);
            if (!layer)
                return state;
            // Update the element in the specified layer
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === layerId
                        ? {
                            ...l,
                            elements: l.elements.map(element => element.id === elementId
                                ? { ...element, ...updates }
                                : element)
                        }
                        : l)
                }
                : s);
            // Auto-save current frame
            const currentFrame = get().currentFrame;
            const updatedLayer = updatedScenes.find(s => s.id === sceneId)?.layers.find(l => l.id === layerId);
            if (!updatedLayer)
                return state;
            // Get existing frame to preserve its length
            const existingFrame = layer.frames.find(f => f.frameNumber === currentFrame);
            // Create or update frame with current elements
            const newFrame = {
                id: existingFrame?.id || generateId(),
                elements: [
                    // Keep existing elements from other layers
                    ...(existingFrame?.elements || []).filter((e) => e.layerType !== layer.type),
                    // Add updated elements from the layer
                    ...updatedLayer.elements.map((e) => ({ ...e }))
                ],
                frameNumber: currentFrame,
                length: existingFrame?.length || 1
            };
            const finalScenes = updatedScenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === layerId
                        ? {
                            ...l,
                            frames: [
                                ...l.frames.filter(f => f.frameNumber !== currentFrame),
                                newFrame
                            ].sort((a, b) => a.frameNumber - b.frameNumber)
                        }
                        : l)
                }
                : s);
            return {
                scenes: finalScenes,
                activeScene: finalScenes.find(s => s.id === sceneId) || null
            };
        });
    },
    setActiveScene: (sceneId) => {
        set((state) => ({
            scenes: state.scenes.map(scene => ({
                ...scene,
                active: scene.id === sceneId
            })),
            activeScene: state.scenes.find(s => s.id === sceneId) || null
        }));
    },
    setSelectedElement: (element) => {
        set((state) => {
            // First, deselect all elements
            const updatedScenes = state.scenes.map(scene => ({
                ...scene,
                layers: scene.layers.map(layer => ({
                    ...layer,
                    elements: layer.elements.map(e => ({
                        ...e,
                        selected: false
                    }))
                }))
            }));
            // If an element is provided, select it
            if (element) {
                const sceneWithElement = updatedScenes.find(scene => scene.layers.some(layer => layer.elements.some(e => e.id === element.id)));
                if (sceneWithElement) {
                    const layerWithElement = sceneWithElement.layers.find(layer => layer.elements.some(e => e.id === element.id));
                    if (layerWithElement) {
                        const elementIndex = layerWithElement.elements.findIndex(e => e.id === element.id);
                        if (elementIndex !== -1) {
                            layerWithElement.elements[elementIndex].selected = true;
                        }
                    }
                }
            }
            return {
                ...state,
                scenes: updatedScenes,
                selectedElement: element
            };
        });
    },
    captureFrame: (sceneId) => {
        const currentFrame = get().currentFrame;
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            // Get the active layer ID
            const activeLayerId = useLayerPanelStore.getState().activeLayerId;
            if (!activeLayerId)
                return state;
            const activeLayer = scene.layers.find(l => l.id === activeLayerId);
            if (!activeLayer)
                return state;
            // Remove existing frame at this position if it exists
            const frames = activeLayer.frames.filter(f => f.frameNumber !== currentFrame);
            // Create new frame with current canvas state
            const frame = {
                id: generateId(),
                elements: [
                    // Keep existing elements from other layers
                    ...(activeLayer.frames.find(f => f.frameNumber === currentFrame)?.elements || [])
                        .filter((e) => e.layerType !== activeLayer.type),
                    // Add elements from the active layer
                    ...activeLayer.elements.map((e) => ({ ...e }))
                ],
                frameNumber: currentFrame,
                length: 1 // Default length is 1 time slot
            };
            // Add frame and auto-advance to next frame
            return {
                scenes: state.scenes.map(s => s.id === sceneId
                    ? { ...s, layers: s.layers.map(layer => layer.id === activeLayerId
                            ? { ...layer, frames: [...frames, frame].sort((a, b) => a.frameNumber - b.frameNumber) }
                            : layer) }
                    : s),
                currentFrame: currentFrame + 1 // Auto-advance to next frame
            };
        });
    },
    deleteFrame: (sceneId, frameId) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            const activeLayerId = useLayerPanelStore.getState().activeLayerId;
            if (!activeLayerId)
                return state;
            const activeLayer = scene.layers.find(l => l.id === activeLayerId);
            if (!activeLayer)
                return state;
            const frameToDelete = activeLayer.frames.find(f => f.id === frameId);
            if (!frameToDelete)
                return state;
            // Remove the frame from the active layer
            const updatedFrames = activeLayer.frames.filter(f => f.id !== frameId);
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === activeLayerId
                        ? { ...l, frames: l.frames.filter(f => f.id !== frameId) }
                        : l)
                }
                : s);
            // If we're deleting the current frame, move to the previous frame or the next available frame
            let newCurrentFrame = state.currentFrame;
            if (frameToDelete.frameNumber === state.currentFrame) {
                const sortedFrames = updatedFrames.sort((a, b) => a.frameNumber - b.frameNumber);
                const prevFrame = sortedFrames.filter(f => f.frameNumber < frameToDelete.frameNumber).pop();
                const nextFrame = sortedFrames.filter(f => f.frameNumber > frameToDelete.frameNumber)[0];
                if (prevFrame) {
                    newCurrentFrame = prevFrame.frameNumber;
                }
                else if (nextFrame) {
                    newCurrentFrame = nextFrame.frameNumber;
                }
                else {
                    newCurrentFrame = 0;
                }
                // Update the canvas elements to show the new current frame's content
                const newFrameContent = sortedFrames.find(f => f.frameNumber === newCurrentFrame);
                updatedScenes.map(s => s.id === sceneId
                    ? {
                        ...s,
                        layers: s.layers.map(l => l.id === activeLayerId
                            ? {
                                ...l,
                                elements: newFrameContent?.elements.filter(e => e.layerType === l.type) || []
                            }
                            : l)
                    }
                    : s);
            }
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null,
                currentFrame: newCurrentFrame
            };
        });
    },
    setCurrentFrame: (frame) => {
        set({ currentFrame: frame });
    },
    playAnimation: () => {
        const { fps } = get();
        set({ isPlaying: true });
        let lastTime = 0;
        const frameTime = 1000 / fps; // Time per frame in ms
        const animate = (currentTime) => {
            const { isPlaying, currentFrame, activeScene } = get();
            if (!isPlaying || !activeScene)
                return;
            // Calculate time elapsed
            const deltaTime = currentTime - lastTime;
            // Check if it's time for next frame
            if (deltaTime >= frameTime) {
                // Get all frames with elements
                const framesWithContent = activeScene.layers
                    .flatMap(layer => layer.frames
                    .filter(f => f.elements.length > 0)
                    .map(f => ({
                    ...f,
                    elements: f.elements.map(e => ({ ...e }))
                })))
                    .sort((a, b) => a.frameNumber - b.frameNumber);
                if (framesWithContent.length === 0) {
                    set({ isPlaying: false });
                    return;
                }
                // Find current frame
                const currentFrameData = framesWithContent.find(f => f.frameNumber <= currentFrame &&
                    currentFrame < f.frameNumber + f.length);
                // If we're within an expanded frame's range and not at its end
                if (currentFrameData && currentFrame < currentFrameData.frameNumber + (currentFrameData.length - 1)) {
                    // Move to next position within the expanded frame
                    set({ currentFrame: currentFrame + 1 });
                }
                else {
                    // Find next frame
                    const nextFrame = framesWithContent.find(f => (currentFrameData
                        ? f.frameNumber > currentFrameData.frameNumber + (currentFrameData.length - 1)
                        : f.frameNumber > currentFrame));
                    // Handle end of animation
                    if (!nextFrame) {
                        // Always loop back to the first frame
                        const firstFrame = framesWithContent[0];
                        set((state) => ({
                            currentFrame: firstFrame.frameNumber,
                            scenes: state.scenes.map(s => s.id === activeScene.id
                                ? {
                                    ...s,
                                    layers: s.layers.map(layer => ({
                                        ...layer,
                                        elements: firstFrame.elements.filter(e => e.layerType === layer.type)
                                    }))
                                }
                                : s),
                            activeScene: {
                                ...activeScene,
                                layers: activeScene.layers.map(layer => ({
                                    ...layer,
                                    elements: firstFrame.elements.filter(e => e.layerType === layer.type)
                                }))
                            }
                        }));
                    }
                    else {
                        // Move to next frame
                        set((state) => ({
                            currentFrame: nextFrame.frameNumber,
                            scenes: state.scenes.map(s => s.id === activeScene.id
                                ? {
                                    ...s,
                                    layers: s.layers.map(layer => ({
                                        ...layer,
                                        elements: nextFrame.elements.filter(e => e.layerType === layer.type)
                                    }))
                                }
                                : s),
                            activeScene: {
                                ...activeScene,
                                layers: activeScene.layers.map(layer => ({
                                    ...layer,
                                    elements: nextFrame.elements.filter(e => e.layerType === layer.type)
                                }))
                            }
                        }));
                    }
                }
                lastTime = currentTime;
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },
    pauseAnimation: () => {
        set({ isPlaying: false });
    },
    loadFrame: (sceneId, frameNumber) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            // Save current frame state first
            const currentFrame = state.currentFrame;
            let updatedScenes = [...state.scenes];
            // If there are elements on canvas, save them to current frame
            if (scene.layers.some(l => l.elements.length > 0)) {
                const existingFrames = scene.layers.map(layer => ({
                    id: layer.frames.find(f => f.frameNumber === currentFrame)?.id || generateId(),
                    elements: layer.frames.find(f => f.frameNumber === currentFrame)?.elements || [],
                    frameNumber: currentFrame,
                    length: layer.frames.find(f => f.frameNumber === currentFrame)?.length || 1
                }));
                const newFrames = existingFrames.map((frame, index) => ({
                    id: frame.id,
                    elements: frame.elements.map(e => ({ ...e, layerType: scene.layers[index].type })),
                    frameNumber: currentFrame,
                    length: frame.length
                }));
                updatedScenes = updatedScenes.map(s => s.id === sceneId
                    ? {
                        ...s,
                        layers: s.layers.map((layer, index) => ({
                            ...layer,
                            frames: [
                                ...layer.frames.filter(f => f.frameNumber !== currentFrame),
                                newFrames[index]
                            ].sort((a, b) => a.frameNumber - b.frameNumber)
                        }))
                    }
                    : s);
            }
            // Now load the selected frame
            const targetFrame = updatedScenes
                .find(s => s.id === sceneId)
                ?.layers.find(l => l.id === useLayerPanelStore.getState().activeLayerId)?.frames.find(f => f.frameNumber === frameNumber);
            // Update scene elements with new frame content or clear canvas
            updatedScenes = updatedScenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => ({
                        ...l,
                        elements: targetFrame
                            ? targetFrame.elements.filter(e => e.layerType === l.type)
                            : []
                    }))
                }
                : s);
            // Find updated active scene to ensure re-render
            const updatedActiveScene = updatedScenes.find(s => s.id === sceneId) || null;
            return {
                currentFrame: frameNumber,
                scenes: updatedScenes,
                activeScene: updatedActiveScene
            };
        });
    },
    clearCanvas: (sceneId) => {
        set((state) => ({
            scenes: state.scenes.map(scene => scene.id === sceneId
                ? { ...scene, layers: scene.layers.map(l => ({ ...l, frames: [] })) }
                : scene)
        }));
    },
    setPlaybackSettings: (fps, duration) => {
        set({ fps, duration });
    },
    selectFrame: (sceneId, frameNumber) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            // Get the active layer ID
            const activeLayerId = useLayerPanelStore.getState().activeLayerId;
            if (!activeLayerId)
                return state;
            const activeLayer = scene.layers.find(l => l.id === activeLayerId);
            if (!activeLayer)
                return state;
            // Save current frame state first
            const currentFrame = state.currentFrame;
            let updatedScenes = [...state.scenes];
            // If there are elements on canvas, save them to current frame
            if (activeLayer.elements.length > 0) {
                const existingFrame = activeLayer.frames.find(f => f.frameNumber === currentFrame);
                const newFrame = {
                    id: existingFrame?.id || generateId(),
                    elements: activeLayer.elements.map(e => ({ ...e })),
                    frameNumber: currentFrame,
                    length: existingFrame?.length || 1
                };
                updatedScenes = updatedScenes.map(s => s.id === sceneId
                    ? {
                        ...s,
                        layers: s.layers.map(layer => layer.id === activeLayerId
                            ? {
                                ...layer,
                                frames: [
                                    ...layer.frames.filter(f => f.frameNumber !== currentFrame),
                                    newFrame
                                ].sort((a, b) => a.frameNumber - b.frameNumber)
                            }
                            : layer)
                    }
                    : s);
            }
            // Now load the selected frame
            const targetFrame = activeLayer.frames.find(f => f.frameNumber === frameNumber);
            // Update only the active layer with its elements
            updatedScenes = updatedScenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(layer => layer.id === activeLayerId
                        ? {
                            ...layer,
                            elements: targetFrame?.elements.filter(e => e.layerType === layer.type) || []
                        }
                        : layer)
                }
                : s);
            return {
                currentFrame: frameNumber,
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null
            };
        });
    },
    duplicateFrame: (sceneId, frameNumber) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            const activeLayerId = useLayerPanelStore.getState().activeLayerId;
            if (!activeLayerId)
                return state;
            const activeLayer = scene.layers.find(l => l.id === activeLayerId);
            if (!activeLayer)
                return state;
            const sourceFrame = activeLayer.frames.find(f => f.frameNumber === frameNumber);
            if (!sourceFrame)
                return state;
            // Create new frame with copied content
            const newFrame = {
                id: generateId(),
                elements: sourceFrame.elements.map((e) => ({ ...e })),
                frameNumber: frameNumber + (sourceFrame.length || 1),
                length: sourceFrame.length || 1 // Copy the length from source frame
            };
            // Add new frame to the active layer
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === activeLayerId
                        ? {
                            ...l,
                            frames: [...l.frames, newFrame].sort((a, b) => a.frameNumber - b.frameNumber)
                        }
                        : l)
                }
                : s);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null,
                currentFrame: newFrame.frameNumber // Auto-select the new frame
            };
        });
    },
    setOnionSkinning: (settings) => {
        set((state) => ({
            onionSkinning: {
                ...state.onionSkinning,
                ...settings
            }
        }));
    },
    setLooping: (loop) => {
        set({ isLooping: loop });
    },
    exportVideo: async (settings) => {
        const { activeScene } = get();
        if (!activeScene)
            return;
        try {
            set({ isExporting: true });
            // Get stage from canvas store
            const stage = useCanvasStore.getState().stage;
            if (!stage)
                throw new Error('No stage found');
            const url = await exportToMP4(activeScene, stage, settings);
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeScene.name}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Cleanup
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Failed to export video:', error);
        }
        finally {
            set({ isExporting: false });
        }
    },
    setExportProgress: (progress) => set({ exportProgress: progress }),
    resizeFrame: (sceneId, frameId, newLength, newFrameNumber) => {
        set((state) => {
            const scene = state.scenes.find(s => s.id === sceneId);
            if (!scene)
                return state;
            const activeLayerId = useLayerPanelStore.getState().activeLayerId;
            if (!activeLayerId)
                return state;
            const activeLayer = scene.layers.find(l => l.id === activeLayerId);
            if (!activeLayer)
                return state;
            // Find the frame being resized
            const frame = activeLayer.frames.find(f => f.id === frameId);
            if (!frame)
                return state;
            // Get all frames in the active layer only, sorted by frame number
            const layerFrames = [...activeLayer.frames].sort((a, b) => a.frameNumber - b.frameNumber);
            const frameIndex = layerFrames.findIndex(f => f.id === frameId);
            // Calculate new frame position and length
            let finalFrameNumber = newFrameNumber !== undefined ? newFrameNumber : frame.frameNumber;
            let finalLength = newLength;
            // Check for collisions with previous frame in the same layer
            if (frameIndex > 0) {
                const prevFrame = layerFrames[frameIndex - 1];
                const minFrameNumber = prevFrame.frameNumber + prevFrame.length;
                finalFrameNumber = Math.max(finalFrameNumber, minFrameNumber);
            }
            // Check for collisions with next frame in the same layer
            if (frameIndex < layerFrames.length - 1) {
                const nextFrame = layerFrames[frameIndex + 1];
                const maxLength = nextFrame.frameNumber - finalFrameNumber;
                finalLength = Math.min(finalLength, maxLength);
            }
            // Update only the active layer's frames
            const updatedScenes = state.scenes.map(s => s.id === sceneId
                ? {
                    ...s,
                    layers: s.layers.map(l => l.id === activeLayerId
                        ? {
                            ...l,
                            frames: l.frames.map(f => f.id === frameId
                                ? {
                                    ...f,
                                    frameNumber: finalFrameNumber,
                                    length: Math.max(1, finalLength)
                                }
                                : f).sort((a, b) => a.frameNumber - b.frameNumber)
                        }
                        : l)
                }
                : s);
            return {
                scenes: updatedScenes,
                activeScene: updatedScenes.find(s => s.id === sceneId) || null
            };
        });
    },
    stopAnimation: () => {
        set((state) => ({
            isPlaying: false,
            currentFrame: 0,
            scenes: state.scenes.map(s => {
                if (s.id === state.activeScene?.id) {
                    // Reset to first frame's content
                    const firstFrames = s.layers
                        .flatMap(layer => layer.frames)
                        .filter(f => f.frameNumber === 0);
                    return {
                        ...s,
                        layers: s.layers.map(layer => ({
                            ...layer,
                            elements: firstFrames
                                .filter(f => f.elements.some(e => e.layerType === layer.type))
                                .flatMap(f => f.elements.filter(e => e.layerType === layer.type))
                        }))
                    };
                }
                return s;
            })
        }));
    }
}));

export function handleStateRequests(socket, io, stateManager) {
    // Send current state to newly connected client
    socket.emit('state_update', stateManager.getState());
    // Handle state update requests
    socket.on('request_state', () => {
        socket.emit('state_update', stateManager.getState());
    });
    // Handle state updates from MCP
    socket.on('update_state', (newState) => {
        console.log('Raw state update received:', newState);
        // Transform and update current state
        const transformedState = transformState(newState);
        stateManager.setState(transformedState);
        console.log('Transformed state:', {
            hasProject: transformedState.currentProject !== null,
            sceneCount: transformedState.scenes.length,
            hasActiveScene: transformedState.activeScene !== null,
            currentFrame: transformedState.currentFrame,
            isPlaying: transformedState.isPlaying,
            activeLayer: transformedState.activeLayer
        });
    });
}
export function transformState(newState) {
    // Handle both initial project state and updates
    const project = newState.projects || newState.currentProject;
    const scenes = newState.scenes || [];
    const activeScene = scenes.find((s) => s.active) || null;
    // Ensure each scene has proper layer structure
    const processedScenes = scenes.map((scene) => ({
        ...scene,
        layers: scene.layers.map(layer => ({
            ...layer,
            elements: layer.elements || [],
            frames: layer.frames || [],
            visible: layer.visible ?? true,
            locked: layer.locked ?? false,
            opacity: layer.opacity ?? 1,
            zIndex: layer.zIndex ?? 0
        }))
    }));
    // Find active layer, prioritizing:
    // 1. Explicitly set active layer
    // 2. Current active layer in active scene
    // 3. First layer in active scene
    const activeLayer = newState.activeLayer ||
        (activeScene?.layers.find((l) => l.id === newState.activeLayer)?.id) ||
        (activeScene?.layers[0]?.id) ||
        null;
    return {
        currentProject: project,
        scenes: processedScenes,
        activeScene: activeScene,
        currentFrame: newState.currentFrame || 0,
        isPlaying: newState.isPlaying || false,
        activeLayer: activeLayer
    };
}

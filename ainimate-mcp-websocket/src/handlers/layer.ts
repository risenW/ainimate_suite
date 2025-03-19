import { Socket } from 'socket.io';
import type { StateUpdate } from '../types.js';
import { generateId } from '../utils.js';

interface StateManager {
  state: StateUpdate;
  setState(newState: Partial<StateUpdate>): void;
  getState(): StateUpdate;
}

export function handleLayerRequests(socket: Socket, io: any, stateManager: StateManager) {
  // Handle layer creation
  socket.on('create_layer', (payload) => {
    try {
      const currentState = stateManager.getState();
      const { sceneId, name, type } = payload;
      
      // Find the scene
      const scene = currentState.scenes.find(s => s.id === sceneId);
      if (!scene) {
        socket.emit('layer_created', {
          success: false,
          message: `Scene ${sceneId} not found`
        });
        return;
      }

      // Create the new layer
      const newLayer = {
        id: generateId(),
        name,
        type,
        elements: [],
        frames: [],
        visible: true,
        locked: false,
        opacity: 1,
        zIndex: scene.layers.length // Set zIndex based on current layer count
      };

      // Add layer to the scene
      scene.layers.push(newLayer);

      // Update state with modified scene
      const updatedScenes = currentState.scenes.map(s => 
        s.id === scene.id ? scene : s
      );

      stateManager.setState({
        scenes: updatedScenes,
        activeScene: scene.active ? scene : currentState.activeScene,
        activeLayer: currentState.activeLayer || newLayer.id
      });

      // Emit success response
      socket.emit('layer_created', {
        success: true,
        layer: newLayer
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      socket.emit('layer_created', {
        success: false,
        message: `Failed to create layer: ${errorMessage}`
      });
    }
  });

  // Handle layer activation
  socket.on('activate_layer', (payload) => {
    try {
      const currentState = stateManager.getState();
      const { sceneId, layerId } = payload;
      
      // Find the scene
      const scene = currentState.scenes.find(s => s.id === sceneId);
      if (!scene) {
        socket.emit('layer_activated', {
          success: false,
          message: `Scene ${sceneId} not found`
        });
        return;
      }

      // Find the layer
      const layer = scene.layers.find(l => l.id === layerId);
      if (!layer) {
        socket.emit('layer_activated', {
          success: false,
          message: `Layer ${layerId} not found`
        });
        return;
      }

      // Update state with active layer
      stateManager.setState({
        activeLayer: layerId
      });

      // Emit success response
      socket.emit('layer_activated', {
        success: true,
        layer: layer
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      socket.emit('layer_activated', {
        success: false,
        message: `Failed to activate layer: ${errorMessage}`
      });
    }
  });
} 

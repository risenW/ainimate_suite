import { Socket } from 'socket.io';
import type { StateUpdate } from '../types.js';
import { generateId } from '../utils.js';

interface StateManager {
  state: StateUpdate;
  setState(newState: Partial<StateUpdate>): void;
  getState(): StateUpdate;
}

export function handleElementRequests(socket: Socket, io: any, stateManager: StateManager) {
  socket.on('create_element', (payload) => {
    try {
      const currentState = stateManager.getState();
      const { sceneId, layerId, type, layerType, position, properties } = payload;
      
      // Find the scene
      const scene = currentState.scenes.find(s => s.id === sceneId);
      if (!scene) {
        socket.emit('element_created', {
          success: false,
          message: `Scene ${sceneId} not found`
        });
        return;
      }

      // Find the layer
      const layer = scene.layers.find(l => l.id === layerId);
      if (!layer) {
        socket.emit('element_created', {
          success: false,
          message: `Layer ${layerId} not found`
        });
        return;
      }

      // Create the new element
      const newElement = {
        id: generateId(),
        type,
        layerType,
        position,
        rotation: 0,
        scale: { x: 1, y: 1 },
        properties: type === 'text' ? {
          shapeType: "text",  // Required for text elements
          text: properties.text || 'Text',
          fontSize: properties.fontSize || 24,
          fontFamily: properties.fontFamily || 'Arial',
          fill: properties.fill || '#000000'
        } : properties
      };

      // Add element to the layer
      layer.elements.push(newElement);

      // Update frames with the new element
      const currentFrame = currentState.currentFrame;
      const existingFrame = layer.frames.find(f => f.frameNumber === currentFrame);
      
      // Create or update frame with current elements
      const newFrame = {
        id: existingFrame?.id || generateId(),
        elements: [
          // Keep existing elements from other layers and this layer's previous elements
          ...(existingFrame?.elements || []).filter(e => 
            e.layerType !== layer.type || 
            layer.elements.some(le => le.id === e.id)
          ),
          // Add the new element
          newElement
        ],
        frameNumber: currentFrame,
        length: existingFrame?.length || 1
      };

      // Update the layer's frames
      layer.frames = [
        ...layer.frames.filter(f => f.frameNumber !== currentFrame),
        newFrame
      ].sort((a, b) => a.frameNumber - b.frameNumber);

      // Emit success response
      socket.emit('element_created', {
        success: true,
        element: newElement
      });

      // Update state with modified scene
      const updatedScenes = currentState.scenes.map(s => 
        s.id === scene.id ? scene : s
      );

      stateManager.setState({
        scenes: updatedScenes,
        activeScene: scene.active ? scene : currentState.activeScene
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      socket.emit('element_created', {
        success: false,
        message: `Failed to create element: ${errorMessage}`
      });
    }
  });
} 
 
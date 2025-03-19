import { Socket } from 'socket.io';
import type { StateUpdate } from '../types.js';
import { generateId } from '../utils.js';

interface StateManager {
  state: StateUpdate;
  setState(newState: Partial<StateUpdate>): void;
  getState(): StateUpdate;
}

export function handleFrameRequests(socket: Socket, io: any, stateManager: StateManager) {
  socket.on('capture_frame', async (payload) => {
    try {
      const currentState = stateManager.getState();
      const { sceneId, frameNumber } = payload;
      
      // Find the scene
      const scene = currentState.scenes.find(s => s.id === sceneId);
      if (!scene) {
        socket.emit('frame_captured', {
          success: false,
          message: `Scene ${sceneId} not found`
        });
        return;
      }

      // Create frame data for each layer
      scene.layers.forEach(layer => {
        const existingFrame = layer.frames.find(f => f.frameNumber === (frameNumber ?? currentState.currentFrame));
        if (existingFrame) {
          // Update existing frame
          existingFrame.elements = [...layer.elements];
        } else {
          // Create new frame
          layer.frames.push({
            id: generateId(),
            elements: [...layer.elements],
            frameNumber: frameNumber ?? currentState.currentFrame,
            length: 1
          });
        }
      });

      // Sort frames by frame number in each layer
      scene.layers.forEach(layer => {
        layer.frames.sort((a, b) => a.frameNumber - b.frameNumber);
      });

      // Update state
      const updatedScenes = currentState.scenes.map(s => 
        s.id === scene.id ? scene : s
      );

      stateManager.setState({
        scenes: updatedScenes,
        activeScene: scene.active ? scene : currentState.activeScene,
        currentFrame: frameNumber ?? currentState.currentFrame
      });

      // Emit success response
      socket.emit('frame_captured', {
        success: true,
        frameNumber: frameNumber ?? currentState.currentFrame,
        scene
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      socket.emit('frame_captured', {
        success: false,
        message: `Failed to capture frame: ${errorMessage}`
      });
    }
  });
} 

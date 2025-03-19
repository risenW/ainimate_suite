import { io, Socket } from 'socket.io-client';
import type { Scene, SceneLayer, SceneElement } from '../types/scene.js';
import type { Project } from '../types/project.js';

interface StateUpdate {
  currentProject: Project | null;
  scenes: Scene[];
  activeScene: Scene | null;
  currentFrame: number;
  isPlaying: boolean;
  activeLayer: string | null;
}

interface CreateElementPayload {
  type: 'shape' | 'text';
  layerType: 'background' | 'midground' | 'foreground';
  sceneId: string;
  layerId: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

interface CreateElementResponse {
  success: boolean;
  element?: SceneElement;
  message?: string;
}

interface CaptureFramePayload {
  sceneId: string;
  frameNumber?: number;
}

interface CaptureFrameResponse {
  success: boolean;
  frameNumber?: number;
  scene?: Scene;
  message?: string;
}

interface CreateLayerPayload {
  sceneId: string;
  name: string;
  type: 'background' | 'midground' | 'foreground';
}

interface CreateLayerResponse {
  success: boolean;
  layer?: any;
  message?: string;
}

interface ActivateLayerPayload {
  sceneId: string;
  layerId: string;
}

interface ActivateLayerResponse {
  success: boolean;
  layer?: any;
  message?: string;
}

let socket: Socket | null = null;
let currentState: StateUpdate = {
  currentProject: null,
  scenes: [],
  activeScene: null,
  currentFrame: 0,
  isPlaying: false,
  activeLayer: null
};

export function getWebSocketClient(): Socket {
  if (!socket) {
    socket = io('http://localhost:3003', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket'],
      upgrade: false
    });

    const client = socket;

    client.on('connect', () => {
      console.log('MCP Server connected to WebSocket server');
      // Request initial state
      client.emit('request_state');
    });

    client.on('disconnect', (reason) => {
      console.log('MCP Server disconnected from WebSocket server:', reason);
    });

    client.on('connect_error', (error) => {
      console.error('MCP Server WebSocket connection error:', error);
    });

    // Handle state updates
    client.on('state_update', (data: StateUpdate) => {
      const hadProject = currentState.currentProject !== null;
      const hasNewProject = data.currentProject !== null;

      // Update local state, preserving activeLayer if not provided
      currentState = {
        ...currentState,
        ...data,
        activeLayer: data.activeLayer !== undefined ? data.activeLayer : currentState.activeLayer
      };

      // Log state changes
      if (!hadProject && hasNewProject) {
        console.log('Project loaded:', currentState.currentProject!.id);
      } else if (hadProject && !hasNewProject) {
        console.log('Project unloaded');
      } else if (hasNewProject && currentState.currentProject!.id !== data.currentProject!.id) {
        console.log('Project changed:', currentState.currentProject!.id);
      }

      // Log overall state update
      console.log('State updated:', {
        hasProject: currentState.currentProject !== null,
        sceneCount: currentState.scenes.length,
        hasActiveScene: currentState.activeScene !== null,
        currentFrame: currentState.currentFrame,
        isPlaying: currentState.isPlaying,
        activeLayer: currentState.activeLayer
      });
    });

    // Handle element creation response
    client.on('element_created', (response: CreateElementResponse) => {
      if (response.success && response.element) {
        // The state will be updated via state_update event
        console.log('Element created:', response.element.id);
      } else {
        console.error('Failed to create element:', response.message);
      }
    });

    // Handle frame capture response
    client.on('frame_captured', (response: CaptureFrameResponse) => {
      if (response.success) {
        console.log('Frame captured:', response.frameNumber);
      } else {
        console.error('Failed to capture frame:', response.message);
      }
    });
  }

  return socket;
}

export function getCurrentState(): StateUpdate {
  return currentState;
}

export function getCurrentProject(): Project | null {
  return currentState.currentProject;
}

export function getActiveScene(): Scene | null {
  return currentState.activeScene;
}

export async function requestState(): Promise<StateUpdate> {
  const client = getWebSocketClient();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request state timed out'));
    }, 5000);

    client.emit('request_state');
    client.once('state_update', (data: StateUpdate) => {
      clearTimeout(timeout);
      currentState = {
        ...currentState,
        ...data
      };
      resolve(currentState);
    });
  });
}

export function getCurrentLayer(): SceneLayer | null {
  if (!currentState.activeScene || !currentState.activeLayer) {
    return null;
  }
  
  return currentState.activeScene.layers.find(layer => layer.id === currentState.activeLayer) || null;
}

export async function createElement(payload: CreateElementPayload): Promise<CreateElementResponse> {
  const client = getWebSocketClient();
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Create element request timed out'));
    }, 5000);

    client.emit('create_element', payload);
    
    client.once('element_created', (response: CreateElementResponse) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

export async function captureFrame(payload: CaptureFramePayload): Promise<CaptureFrameResponse> {
  const client = getWebSocketClient();
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Capture frame request timed out'));
    }, 5000);

    client.emit('capture_frame', payload);
    
    client.once('frame_captured', (response: CaptureFrameResponse) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

export async function createLayer(payload: CreateLayerPayload): Promise<CreateLayerResponse> {
  const client = getWebSocketClient();
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Create layer request timed out'));
    }, 5000);

    client.emit('create_layer', payload);
    
    client.once('layer_created', (response: CreateLayerResponse) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

export async function activateLayer(payload: ActivateLayerPayload): Promise<ActivateLayerResponse> {
  const client = getWebSocketClient();
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Activate layer request timed out'));
    }, 5000);

    client.emit('activate_layer', payload);
    
    client.once('layer_activated', (response: ActivateLayerResponse) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
} 

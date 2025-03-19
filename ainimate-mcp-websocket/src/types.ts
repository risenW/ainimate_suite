export interface Position {
  x: number;
  y: number;
}

export interface Scale {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  type: 'shape' | 'text';
  layerType: 'background' | 'midground' | 'foreground';
  position: Position;
  rotation: number;
  scale: Scale;
  properties: Record<string, any>;
}

export interface Layer {
  id: string;
  name: string;
  type: 'background' | 'midground' | 'foreground';
  visible: boolean;
  locked: boolean;
  opacity: number;
  elements: Element[];
  frames: LayerFrame[];
  zIndex: number;
}

export interface Scene {
  id: string;
  name: string;
  layers: Layer[];
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  settings: {
    width: number;
    height: number;
    fps: number;
  };
}

export interface StateUpdate {
  currentProject: Project | null;
  scenes: Scene[];
  activeScene: Scene | null;
  currentFrame: number;
  isPlaying: boolean;
  activeLayer: string | null;
}

export interface LayerFrame {
  id: string;
  elements: Element[];
  frameNumber: number;
  length: number;
}

export interface SceneElement {
  id: string;
  type: 'image' | 'shape' | 'text' | 'drawing';
  layerType: 'background' | 'midground' | 'foreground';
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  properties: Record<string, any>;
} 

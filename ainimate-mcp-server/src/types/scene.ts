export interface Position {
  x: number;
  y: number;
}

export interface Scale {
  x: number;
  y: number;
}

export interface ShapeProperties {
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'line';
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextProperties {
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface SceneElement {
  id: string;
  type: 'shape' | 'text';
  layerType: 'background' | 'midground' | 'foreground';
  position: Position;
  rotation: number;
  scale: Scale;
  properties: ShapeProperties | TextProperties;
}

export interface SceneLayer {
  id: string;
  name: string;
  type: 'background' | 'midground' | 'foreground';
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  zIndex?: number;
  elements: SceneElement[];
  frames: SceneFrame[];
}

export interface SceneFrame {
  id: string;
  frameNumber: number;
  elements: SceneElement[];
}

export interface Scene {
  id: string;
  name: string;
  layers: SceneLayer[];
} 

/**
 * Project settings interface
 */
export interface ProjectSettings {
  name: string;
  width: number;
  height: number;
  fps: number;
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  name: string;
  settings: {
    width: number;
    height: number;
    fps: number;
  };
  created: string;
}

/**
 * Layer interface
 */
export interface Layer {
  id: string;
  name: string;
  type: 'background' | 'midground' | 'foreground';
}

/**
 * Scene interface
 */
export interface Scene {
  id: string;
  name: string;
  layers: Layer[];
}

/**
 * Position interface
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Scale interface
 */
export interface Scale {
  x: number;
  y: number;
}

/**
 * Shape properties interface
 */
export interface ShapeProperties {
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'line';
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/**
 * Text properties interface
 */
export interface TextProperties {
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

/**
 * Element interface
 */
export interface Element {
  id: string;
  type: 'shape' | 'text';
  layerType: 'background' | 'midground' | 'foreground';
  position: Position;
  rotation: number;
  scale: Scale;
  properties: ShapeProperties | TextProperties;
}

/**
 * Frame interface
 */
export interface Frame {
  id: string;
  frameNumber: number;
  length: number;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
} 

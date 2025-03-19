import { ShapeType } from "./shape";

export interface SceneElement {
  id: string;
  type: 'image' | 'shape' | 'text' | 'drawing';
  layerType: 'background' | 'midground' | 'foreground';
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  selected?: boolean;
  properties: {
    shapeType?: string;
    width?: number;
    height?: number;
    fill?: string;
    text?: string;
    points?: number[];
    stroke?: string;
    strokeWidth?: number;
    tension?: number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
    easing?: {
      property: 'position' | 'rotation' | 'scale' | 'opacity';
      function: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
      startFrame: number;
      endFrame: number;
    };
    [key: string]: unknown;
  };
} 

export const LAYOUT = {
  HEADER: {
    HEIGHT: 56, // 14px * 4
  },
  TOOLBAR: {
    WIDTH: 24, // 52px + borders
    BUTTON_SIZE: 40,
    PADDING: 2,
  },
  PANELS: {
    RIGHT_PANEL_WIDTH: 320,
  },
  TIMELINE: {
    HEIGHT: 200,
  },
  CANVAS: {
    PADDING: 32,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 5,
  },
} as const; 

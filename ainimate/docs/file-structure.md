# Project File Structure

## Core Components

### Timeline System
- `components/timeline/`
  - `timeline.tsx` - Main timeline component with track management and playback controls
  - `timeline-ruler.tsx` - Ruler component showing frames and time markers
  - `timeline-track.tsx` - Individual track component handling keyframes
  - `playback-controls.tsx` - Playback controls (play, pause, seek)
  - `track-empty-state.tsx` - Empty state UI when no tracks exist

### Editor Components
- `components/editor/`
  - `canvas/` - Canvas related components
    - `animator-canvas.tsx` - Main animation canvas
    - `canvas-toolbar.tsx` - Toolbar for canvas actions
    - `canvas-grid.tsx` - Grid overlay for canvas
    - `toolbar-button.tsx` - Reusable toolbar button component
    - `toolbar-submenu.tsx` - Submenu for toolbar options
  - `control-panel/` - Control panel components
    - `control-panels.tsx` - Main control panel container
    - `shape-properties.tsx` - Properties panel for shapes
    - `canvas-settings.tsx` - Canvas settings panel
  - `scene/` - Scene management components
    - `scene-element.tsx` - Individual scene element component
  - `sidebar/` - Editor sidebar components

### Project Management
- `components/project/` - Project management components

### Character System
- `components/character/` - Character related components

### Script Management
- `components/script/` - Script editing and management

### Export System
- `components/export/` - Export related components

### UI Components
- `components/ui/` - Shadcn UI components
  - `button.tsx`
  - `dialog.tsx`
  - `input.tsx`
  - `slider.tsx`
  - `menubar.tsx`
  - etc.

### Navigation & Theme
- `components/navigation/` - Navigation components
- `components/theme/`
  - `theme-provider.tsx` - Theme context provider
  - `theme-toggle.tsx` - Theme switcher

## State Management
- `lib/store/`
  - `timeline-store.ts` - Timeline state and animations
  - `project-store.ts` - Project management state
  - `scene-store.ts` - Scene management state
  - `tool-store.ts` - Tool selection and state

## AI Integration
- `lib/ai/`
  - `editor-commands.ts` - AI editor command definitions
  - `command-executor.ts` - AI command execution logic

## Hooks
- `hooks/`
  - `use-canvas-handlers.ts` - Canvas event handlers
  - `use-canvas-shortcuts.ts` - Canvas keyboard shortcuts

## Types
- `types/` - TypeScript type definitions
- `lib/types/` - Additional internal type definitions

## Constants
- `lib/constants/` - Application constants

## Utils
- `lib/utils/` - Utility functions directory
- `lib/utils.ts` - Common utility functions

## Pages
- `app/`
  - `page.tsx` - Landing page
  - `editor/page.tsx` - Main editor page
  - `layout.tsx` - Root layout
  - `globals.css` - Global styles

## Configuration
- `tailwind.config.ts` - Tailwind configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - Shadcn UI configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration

## Documentation
- `docs/`
  - `file-structure.md` - This documentation
  - `ainimate_docs.md` - Project documentation 

# **MVP Document: AI-Powered 2D Animation Page Editor with Advanced Custom Character Support**

## **1\. Overview**

This project is a lightweight, component-driven 2D animation editor that enables users—both beginners and advanced—to create animated scenes with ease. Users provide a script, and the tool automatically generates lip-sync and hand gesture animations using the OpenAI LLM API. Additionally, users can change scenes/backgrounds, adjust character positions, and advanced users can create custom characters by assembling body parts and assigning gestures. The tool is built as a single-page app (SPA) with a modular, component-based architecture, drawing inspiration from popular design tools.

## **2\. Objectives**

* **Simplified Animation Creation:**  
   Enable non-experts to create animated scenes using a library of default body parts with pre-defined joints and backgrounds.

* **Automated Animation Generation:**  
   Leverage AI (via OpenAI LLM) to analyze scripts, extract phonemes for lip-sync, and auto-generate movement suggestions (e.g., hand gestures).

* **Flexible Scene Management:**  
   Allow users to change the scene or background and position characters within the scene.

* **Custom Character Creation:**  
   Support advanced users by allowing them to assemble custom characters from individual body parts, define joints, and assign custom gestures.

* **Component-Driven Editor:**  
   Build the app as a single-page editor that relies on modular, reusable components.

* **Intuitive UI/UX:**  
   Provide a modern, familiar interface (inspired by tools like Figma and Adobe Animate) with dedicated panels for LLM interactions, timeline editing, and real-time preview.

## **3\. Tech Stack**

* **Frontend:**  
  * **Next.js:** SPA framework and component-driven development.  
  * **shadcn UI:** For accessible, customizable, and consistent UI components.  
* **Animation Engine:**  
  * **Canvas Tool:** High-performance canvas library (PixiJS or Konva) for frame-based editing and interactive drag-and-drop.  
* **Backend (Future):**  
  * **Supabase:** For user authentication, data storage, and real-time collaboration.  
* **AI Integration:**  
  * **OpenAI LLM API:** For script processing, phoneme extraction, and automated movement suggestions.  
* **Audio Integration:**  
  * **Web Audio API:** To visualize audio waveforms and sync keyframes with audio cues.

## **4\. System Architecture**

### **4.1. Component-Driven Structure**

The app is built as a single, dynamic editor with key components:

* **Main Editor Component:**  
   Central animation canvas and timeline.  
* **Sidebar Panels:**  
  * **Character Builder:** For assembling default and custom characters.  
  * **LLM Panel:** For script input and AI interactions.  
  * **Scene Manager:** For selecting and changing scenes/backgrounds.  
* **Control Bar:**  
   Playback controls, export options, and navigation between modes (animation, script, audio).

### **4.2. High-Level Modules**

* **AnimatorCanvas Component:**  
  * Displays the animation timeline.  
  * Supports frame-based editing, drag-and-drop positioning, and renders characters and scenes.  
* **KeyframeTimeline Component:**  
  * Visual timeline with draggable keyframes.  
  * Syncs with the audio waveform and AI-generated suggestions.  
* **CharacterBuilder Component:**  
  * Default library of body parts (head, torso, arms, legs) with predefined joints.  
  * Supports custom character assembly for advanced users with a drag-and-drop interface.  
  * Includes a "Gesture Assignment" tool to define custom gestures and associate them with specific actions (e.g., wave, nod, point).  
* **SceneManager Component:**  
  * Allows users to change the background/scene.  
  * Provides a list of default scenes and the option to upload custom backgrounds.  
  * Supports repositioning characters within the scene.  
* **ScriptInput & LLM Panel Component:**  
  * Dedicated UI for script entry and AI interaction.  
  * Displays AI-generated animation suggestions (timings, gestures, mouth shapes) that users can accept or modify.  
* **AudioUploader & WaveformViewer Components:**  
  * Manage audio uploads and display waveforms.  
  * Enable syncing of keyframes to audio cues.  
* **ControlPanel Component:**  
  * Contains playback controls, export options, undo/redo functions, and mode toggles.

### **4.3. AI Integration Layer**

* **Script Analysis Module:**  
  * Uses OpenAI API to parse the script and extract tempo, punctuation, and phoneme data.  
* **LLM Function Calling:**  
  * Defines functions that generate structured animation suggestions, including keyframe timings, gesture types, and intensities.  
  * Integrates with the CharacterBuilder to map gestures to specific body parts.

## **5\. Data Structure for Custom Characters & Gestures**

To support advanced customization, define a robust data structure:

### **Character Data Model**

interface Character {

  id: string;

  name: string;

  position: {

    x: number;

    y: number;

  };

  bodyParts: BodyPart\[\];

  customGestures: Gesture\[\];

}

interface BodyPart {

  id: string;

  type: 'head' | 'torso' | 'arm' | 'leg' | 'accessory';

  imageUrl: string;

  joints: Joint\[\];

  defaultPosition: {

    x: number;

    y: number;

  };

  transform?: Transform; // For rotations, scaling

}

interface Joint {

  id: string;

  name: string;

  parentPartId: string;

  anchorPoint: {

    x: number; // relative position on the body part image

    y: number;

  };

  allowedRange: {

    minAngle: number;

    maxAngle: number;

  };

}

interface Transform {

  rotation: number;

  scale: number;

}

interface Gesture {

  id: string;

  name: string;

  affectedBodyParts: string\[\]; // List of BodyPart ids

  movementSequence: MovementFrame\[\]; // Sequence of keyframes describing the gesture

}

interface MovementFrame {

  timestamp: number; // Frame time or relative time

  transforms: {

    \[bodyPartId: string\]: {

      rotation: number;

      position: { x: number; y: number };

      scale?: number;

    };

  };

}

### **Scene Data Model**

interface Scene {

  id: string;

  name: string;

  backgroundImageUrl: string;

  characters: CharacterInstance\[\];

}

interface CharacterInstance {

  characterId: string;

  position: {

    x: number;

    y: number;

  };

  // Optional override of character-specific transforms

  customTransforms?: {

    \[bodyPartId: string\]: Transform;

  };

}

This structured approach ensures that the tool can store all necessary data for both default and custom characters, while also allowing the LLM to reference gesture definitions for automated movement suggestions.

## **6\. Feature Requirements & Details**

### **6.1. Custom Animator Canvas & Scene Manager**

* **Frame-Based Editing & Positioning:**  
  * Users navigate frames and place characters in the scene.  
  * Support for repositioning characters and modifying background scenes.  
* **Default & Custom Body Parts:**  
  * Provide a default library and allow advanced users to add or modify body parts.  
  * Allow users to set joint positions and ranges for each body part.  
* **Gesture Assignments:**  
  * Enable users to assign custom gestures to body parts.  
  * Gestures are defined as sequences of keyframes (movement frames) and stored in the data structure.  
  * The LLM references these gestures to generate and suggest animation sequences.

### **6.2. Script & LLM-Driven Animation**

* **Script Input & AI Suggestions:**  
  * Users input a script in the dedicated LLM panel.  
  * The LLM processes the script, suggesting timings for lip-sync and gestures.  
  * Suggestions are visually rendered on the timeline, with options for user adjustments.  
* **Lip-Sync & Hand Gesture Automation:**  
  * Map phonemes to mouth shapes and align with the audio waveform.  
  * Use punctuation and emphasis cues to trigger hand gestures or other body movements.

### **6.3. Audio Integration**

* **Audio Upload & Waveform Sync:**  
  * Users upload audio files that are processed and displayed as waveforms.  
  * Keyframes align with audio cues for accurate lip-sync and gesture timing.

## **7\. UI/UX Design**

### **7.1. Overall Layout**

* **Component-Centric Interface:**  
  * Single-page editor with distinct areas for the animation canvas, character/scene management, LLM panel, and control bar.  
* **Modern and Minimalist:**  
  * Clean design with ample whitespace, intuitive icons, and a layout reminiscent of Figma or Adobe Animate.  
  * Responsive design that adapts to desktop and tablet views.

### **7.2. LLM Panel UI**

* **Dedicated Sidebar/Modal:**  
  * A clear area for script input, displaying real-time AI suggestions.  
  * Uses card-based layouts to show each suggestion with details like timing, gesture type, and confidence levels.  
* **Interactive Adjustments:**  
  * Users can click on suggestions to preview their effects, tweak parameters with sliders, and view the impact on the timeline immediately.  
  * Visual indicators (color coding, animations) differentiate between AI-suggested keyframes and user modifications.

### **7.3. Scene & Character Management UI**

* **Scene Manager:**  
  * A sidebar component displaying available backgrounds/scenes.  
  * Drag-and-drop interface to assign a background to the canvas.  
* **Character Builder & Customization:**  
  * Drag-and-drop panel for default and custom body parts.  
  * Intuitive controls for positioning characters within the scene and adjusting joint anchors.  
  * An advanced settings modal for assigning custom gestures, editing body part properties, and saving custom character rigs.

### **7.4. General UI/UX Guidelines**

* **Consistency & Accessibility:**  
  * Leverage shadcn UI components to maintain visual consistency and ensure accessibility.  
* **Visual Feedback:**  
  * Provide real-time previews and interactive feedback for drag-and-drop actions, keyframe adjustments, and scene changes.  
* **User Guidance:**  
  * Tooltips, inline help, and documentation integrated into the UI for onboarding and support.  
* **Familiar Interaction Patterns:**  
  * Use common paradigms such as layer panels, timeline scrubbing, and modal dialogs to reduce the learning curve.

## **8\. Implementation Roadmap**

### **Phase 1: Core Framework & Basic Editor**

* **Setup Next.js Project:**  
  * Initialize with shadcn UI and establish a component-centric structure.  
* **Develop Core Components:**  
  * **AnimatorCanvas:** Render frames, support keyframe editing.  
  * **KeyframeTimeline:** Build an interactive timeline.  
  * **SceneManager:** Enable background/scene selection and character repositioning.  
  * **CharacterBuilder:** Implement default body parts with drag-and-drop assembly and joint configuration.

### **Phase 2: Script Analysis & AI Integration**

* **Integrate OpenAI API:**  
  * Build modules for script analysis, phoneme extraction, and LLM function calling.  
  * Create the LLM Panel to display and interact with AI-generated suggestions.

### **Phase 3: Audio Integration & Sync**

* **Audio Uploader & WaveformViewer:**  
  * Enable audio file uploads and display audio waveforms.  
  * Synchronize keyframes with audio data.

### **Phase 4: Advanced Customization Features**

* **Custom Character & Gesture Support:**  
  * Extend the CharacterBuilder to allow custom body part uploads and gesture assignments.  
  * Implement data structure support for saving and referencing custom character rigs and gestures.  
* **Custom UI Modals:**  
  * Provide modals for advanced character customization, gesture assignment, and data structure editing.

### **Phase 5: Polishing, Export, and User Testing**

* **Manual Adjustments & Overrides:**  
  * Allow users to refine keyframes, adjust gestures, and modify character positions.  
* **Playback & Export:**  
  * Implement real-time playback and multiple export options (e.g., GIF, MP4, JSON).  
* **User Testing & Feedback:**  
  * Conduct sessions to collect feedback, then iterate on UI/UX improvements.

### **Phase 6: Backend Integration with Supabase (Post-MVP)**

* **User Authentication & Project Storage:**  
  * Integrate Supabase for secure user data management and real-time collaboration.  
* **Advanced Collaboration:**  
  * Enable multiple users to work on a project concurrently with live updates.

## **9\. Code Structure & Guidelines**

### **9.1. Directory Structure (Next.js)**

/app

  /components

    AnimatorCanvas.tsx          // Animation canvas with frame-based editing.

    KeyframeTimeline.tsx        // Interactive timeline with keyframe and audio sync.

    ScriptInputLLMPanel.tsx     // Sidebar/modal for script input and AI suggestions.

    CharacterBuilder.tsx        // Drag-and-drop character builder with body parts and joint management.

    SceneManager.tsx            // Component for background/scene selection and character positioning.

    AudioUploader.tsx           // Audio upload and waveform display.

    ControlPanel.tsx            // Playback, export, and editor controls.

  /pages

    index.tsx                   // Landing page (minimal, redirects to editor).

    editor.tsx                  // Main editor interface combining all components.

  /lib

    openai.ts                   // Module for OpenAI API calls and LLM function integration.

    canvasEngine.ts             // Abstraction for canvas library integration (PixiJS/Konva).

  /styles

    globals.css               // Global styling and theme settings.

### **9.2. Coding Guidelines**

* **Component Modularity:**  
  * Each component should be self-contained and reusable.  
* **State Management:**  
  * Use React hooks and context for managing editor state, character data, and animation keyframes.  
* **API Abstraction:**  
  * Encapsulate interactions with OpenAI and (future) Supabase in dedicated modules.  
* **Documentation & Testing:**  
  * Provide inline documentation, README files, and unit/integration tests for key components and functions.

## **10\. Maintenance & Future Enhancements**

* **Extensibility:**  
  * Modular design to support additional body parts, custom gestures, and advanced animation features.  
* **AI Model Updates:**  
  * Regularly update LLM function definitions as OpenAI models evolve.  
* **Performance Optimization:**  
  * Optimize canvas rendering and consider offloading heavy processing to Web Workers.  
  * Implement browser compatibility checks and fallbacks
  * Establish performance benchmarks for animation smoothness and AI response times
* **User Feedback Loop:**  
  * Integrate analytics and feedback systems to refine AI suggestions and UI/UX.  
* **Documentation & Tutorials:**  
  * Maintain comprehensive guides, video tutorials, and a dynamic knowledge base for users.
* **Core Feature Enhancements:**
  * Implement robust undo/redo system with command pattern for all editor actions
  * Add template system for common character poses and animations
  * Create local storage strategy for auto-saving and project recovery
  * Develop asset library management for organizing custom characters and backgrounds
  * Add export quality controls and format options (GIF, MP4, WebM)
* **Error Handling:**
  * Implement comprehensive error boundaries for component failures
  * Add graceful fallbacks for AI suggestion failures
  * Create user-friendly error messages and recovery options

## **11\. Deployment & CI/CD**

* **Development & Staging:**  
  * Deploy on Vercel with staging environments for testing new features.  
* **Production:**  
  * Securely manage environment variables for API keys and credentials.  
* **CI/CD Pipeline:**  
  * Integrate automated tests, linting, and deployment workflows for continuous integration.

---

This comprehensive MVP document now includes support for changing scenes/backgrounds, adjusting character positions, and enabling advanced users to create custom characters with a defined data structure for body parts and gestures. The design leverages component-driven architecture and modern UI principles to provide an intuitive experience similar to popular tools.

---

**Citations:**

* Next.js Documentation  
* shadcn UI Guidelines  
* OpenAI API Documentation  
* PixiJS / Konva Documentation  
* Supabase Documentation  
* Web Audio API Documentation  
* Various design tool UI patterns from Figma and Adobe Animate



Test prompt:

Create a bouncing ball animation: 1. Create a red circle at (500, 50), 2. Add keyframe at frame 0 with y=50, 3. Add keyframe at frame 15 with y=450 and easeIn, 4. Add keyframe at frame 30 with y=150 and easeOut



Create a stick figure:
- Head: circle at (300, 100)
- Body: line from (300, 150) to (300, 250)
- Left arm: line from (300, 180) to (250, 200)
- Right arm: line from (300, 180) to (350, 200)
- Left leg: line from (300, 250) to (250, 350)
- Right leg: line from (300, 250) to (350, 350)


Create a stick figure that waves its right arm. Start with a circle for the head at (300, 100), then add the body as a vertical line from (300, 150) to (300, 250), add legs as two diagonal lines from the bottom of the body - one to (250, 350) and one to (350, 350). For the arms, add a left arm as a line from (300, 180) to (250, 200), and for the right arm that will wave, start it at (300, 180) and make it move up and down between (350, 160) and (350, 200) over 30 frames using easeInOut for smooth motion

cr

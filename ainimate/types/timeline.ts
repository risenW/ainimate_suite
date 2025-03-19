export interface Timeline {
  currentFrame: number
  totalFrames: number
  isPlaying: boolean
  fps: number
  tracks: Track[]
}

export interface Track {
  id: string
  name: string
  type: 'character' | 'scene' | 'audio'
  keyframes: Keyframe[]
  visible: boolean
  locked: boolean
}

export interface Keyframe {
  id: string
  frame: number
  type: 'movement' | 'gesture' | 'expression' | 'scene-change'
  data: Record<string, unknown> // More specific than 'any'
} 

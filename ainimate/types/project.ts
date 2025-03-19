export interface ProjectSettings {
  name: string
  width: number
  height: number
  fps: number
  duration: number // in seconds
}

export interface Project {
  id: string
  settings: ProjectSettings
  created: Date
  lastModified: Date
} 

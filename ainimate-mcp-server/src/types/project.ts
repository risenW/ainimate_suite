export interface ProjectSettings {
  name: string;
  width: number;
  height: number;
  fps: number;
}

export interface Project {
  id: string;
  name: string;
  settings: ProjectSettings;
  created: string;
} 

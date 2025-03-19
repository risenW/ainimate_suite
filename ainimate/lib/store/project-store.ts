import { create } from "zustand"
import { Project, ProjectSettings } from "@/types/project"
import { generateId } from "@/lib/utils"
import { useSceneStore } from "@/lib/store/scene-store"

interface ProjectStore {
  currentProject: Project | null
  projects: Project[]
  createProject: (settings: ProjectSettings) => Project
  loadProject: (id: string) => void
  saveProject: () => void
  updateProjectSettings: (settings: Partial<Project['settings']>) => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProject: null,
  projects: [],
  
  createProject: (settings: ProjectSettings) => {
    const project: Project = {
      id: generateId(),
      settings,
      created: new Date(),
      lastModified: new Date(),
    }

    // Create initial scene
    const sceneStore = useSceneStore.getState()
    sceneStore.createScene('Scene 1')

    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project
    }))

    return project
  },
  
  loadProject: (id: string) => {
    const { projects } = get()
    const project = projects.find((p) => p.id === id)
    if (project) {
      set({ currentProject: project })
    }
  },
  
  saveProject: () => {
    const { currentProject, projects } = get()
    if (!currentProject) return
    
    const updatedProject = {
      ...currentProject,
      lastModified: new Date(),
    }
    
    set({
      currentProject: updatedProject,
      projects: projects.map((p) => 
        p.id === updatedProject.id ? updatedProject : p
      ),
    })
  },
  
  updateProjectSettings: (newSettings) => 
    set((state) => ({
      currentProject: state.currentProject ? {
        ...state.currentProject,
        settings: {
          ...state.currentProject.settings,
          ...newSettings
        }
      } : null
    }))
})) 

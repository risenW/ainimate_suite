import { create } from "zustand";
import { generateId } from "@/lib/utils";
import { useSceneStore } from "@/lib/store/scene-store";
export const useProjectStore = create((set, get) => ({
    currentProject: null,
    projects: [],
    createProject: (settings) => {
        const project = {
            id: generateId(),
            settings,
            created: new Date(),
            lastModified: new Date(),
        };
        // Create initial scene
        const sceneStore = useSceneStore.getState();
        sceneStore.createScene('Scene 1');
        set((state) => ({
            projects: [...state.projects, project],
            currentProject: project
        }));
        return project;
    },
    loadProject: (id) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === id);
        if (project) {
            set({ currentProject: project });
        }
    },
    saveProject: () => {
        const { currentProject, projects } = get();
        if (!currentProject)
            return;
        const updatedProject = {
            ...currentProject,
            lastModified: new Date(),
        };
        set({
            currentProject: updatedProject,
            projects: projects.map((p) => p.id === updatedProject.id ? updatedProject : p),
        });
    },
    updateProjectSettings: (newSettings) => set((state) => ({
        currentProject: state.currentProject ? {
            ...state.currentProject,
            settings: {
                ...state.currentProject.settings,
                ...newSettings
            }
        } : null
    }))
}));

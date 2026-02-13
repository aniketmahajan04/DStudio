import { create } from "zustand";

type WorkspaceType = "connections" | "saved" | "history";

interface WorkspaceStore {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (workspace: WorkspaceType) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspace: "connections",
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));

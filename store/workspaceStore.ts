import { create } from "zustand";

type WorkspaceType =
  | "connections"
  | "saved queries"
  | "history"
  | "recent connection";

interface WorkspaceStore {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (workspace: WorkspaceType) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspace: "connections",
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));

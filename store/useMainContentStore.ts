import { create } from "zustand";

type MainContentAreaType =
  | "Data Explorer"
  | "Schema Visualizer"
  | "Query Builder"
  | "DDL";

interface MainContentAreaStore {
  activeMainContentArea: MainContentAreaType;
  setActiveMainContentArea: (mainContentArea: MainContentAreaType) => void;
}

export const useMainContentStore = create<MainContentAreaStore>((set) => ({
  activeMainContentArea: "Data Explorer",
  setActiveMainContentArea: (mainContentArea) =>
    set({ activeMainContentArea: mainContentArea }),
}));

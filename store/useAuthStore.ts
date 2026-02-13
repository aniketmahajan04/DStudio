import { create } from "zustand";

interface User {
  id: string;
  role: "USER" | "ADMIN";
  email: string;
  name?: string;
}

interface AuthStore {
  // user auth store
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // singing model state
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  isSignInModalOpen: false,
  openSignInModal: () => set({ isSignInModalOpen: true }),
  closeSignInModal: () => set({ isSignInModalOpen: false }),
}));
